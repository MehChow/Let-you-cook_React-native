import assert from "node:assert/strict";
import { after, test } from "node:test";

import { and, eq, isNull } from "drizzle-orm";

import { createApp } from "../app";
import { verifyPassword } from "./password";
import type {
  AuthChallengeResponse,
  AuthSessionResponse,
} from "../contracts/auth";
import { db, pool } from "../db/client";
import { authChallenges, refreshTokens, users } from "../db/schema";
import { InMemoryEmailSender } from "../email/emailSender";

process.env.JWT_SECRET ??= "test-secret";

const emailSender = new InMemoryEmailSender();
const app = createApp({ emailSender });

// Sends one JSON mutation through the real Auth route tree.
const postJson = (
  targetApp: ReturnType<typeof createApp>,
  path: string,
  body: object,
) =>
  targetApp.request(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

// Creates one unverified account and returns its delivered challenge code.
const signUpUnverified = async (
  targetApp: ReturnType<typeof createApp>,
  email: string,
  password: string,
) => {
  const signupResponse = await postJson(targetApp, "/v1/auth/signup", {
    email,
    password,
    displayName: "Concurrency Tester",
  });
  assert.equal(signupResponse.status, 201);
  const challenge = (await signupResponse.json()) as AuthChallengeResponse;
  const code = emailSender.messages.at(-1)?.text.match(/\b\d{6}\b/)?.[0];
  assert.ok(code);
  return { challenge, code };
};

// Creates one verified account and its initial full session.
const signUpAndVerify = async (
  targetApp: ReturnType<typeof createApp>,
  email: string,
  password: string,
) => {
  const { challenge, code } = await signUpUnverified(
    targetApp,
    email,
    password,
  );
  const confirmation = await postJson(
    targetApp,
    "/v1/auth/email-verification/confirmations",
    { challengeId: challenge.challengeId, code },
  );
  assert.equal(confirmation.status, 200);
  return (await confirmation.json()) as AuthSessionResponse;
};

// Creates a reusable barrier that releases exactly after every party arrives.
const createBarrier = (parties: number) => {
  let calls = 0;
  let release: () => void = () => undefined;
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });

  return {
    get calls() {
      return calls;
    },
    // Waits until the configured number of concurrent operations arrive.
    async wait() {
      calls += 1;
      if (calls === parties) {
        release();
      }
      await released;
    },
  };
};

// Creates an explicit entry/release gate for deterministic race ordering.
const createGate = () => {
  let signalEntered: () => void = () => undefined;
  let release: () => void = () => undefined;
  const entered = new Promise<void>((resolve) => {
    signalEntered = resolve;
  });
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });

  return {
    entered,
    release,
    // Signals the observation point and waits for the test to continue.
    async wait() {
      signalEntered();
      await released;
    },
  };
};

// Rejects if an expected concurrency hook never reaches its observation point.
const waitForGate = (entered: Promise<void>) =>
  new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Concurrency gate was not reached.")),
      1_000,
    );
    entered.then(
      () => {
        clearTimeout(timeout);
        resolve();
      },
      (error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });

test("concurrent duplicate signup persists and delivers only one account", async () => {
  const email = `signup-concurrency-${Date.now()}@example.com`;
  const password = "correct-horse-batter";
  const messageCount = emailSender.messages.length;

  try {
    const input = { email, password, displayName: "Concurrent Signup" };
    const responses = await Promise.all([
      postJson(app, "/v1/auth/signup", input),
      postJson(app, "/v1/auth/signup", input),
    ]);

    assert.deepEqual(
      responses.map((response) => response.status).sort(),
      [201, 409],
    );
    assert.equal(emailSender.messages.length, messageCount + 1);
    assert.equal(
      (await db.select({ id: users.id }).from(users).where(eq(users.email, email)))
        .length,
      1,
    );
  } finally {
    await db.delete(users).where(eq(users.email, email));
  }
});

test("concurrent email confirmation consumes one OTP only once", async () => {
  const email = `otp-consumption-${Date.now()}@example.com`;
  const password = "correct-horse-batter";

  try {
    const { challenge, code } = await signUpUnverified(app, email, password);
    const input = { challengeId: challenge.challengeId, code };
    const responses = await Promise.all([
      postJson(app, "/v1/auth/email-verification/confirmations", input),
      postJson(app, "/v1/auth/email-verification/confirmations", input),
    ]);

    assert.deepEqual(
      responses.map((response) => response.status).sort(),
      [200, 400],
    );
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    assert.ok(user);
    assert.equal(
      (
        await db
          .select({ id: refreshTokens.id })
          .from(refreshTokens)
          .where(eq(refreshTokens.userId, user.id))
      ).length,
      1,
    );
  } finally {
    await db.delete(users).where(eq(users.email, email));
  }
});

test("concurrent resend replaces one OTP lineage with one delivery", async () => {
  const email = `otp-replacement-${Date.now()}@example.com`;
  const password = "correct-horse-batter";

  try {
    const { challenge } = await signUpUnverified(app, email, password);
    await db
      .update(authChallenges)
      .set({ lastSentAt: new Date(0) })
      .where(eq(authChallenges.id, challenge.challengeId));
    const messageCount = emailSender.messages.length;
    const responses = await Promise.all([
      postJson(app, "/v1/auth/email-verification/requests", { email }),
      postJson(app, "/v1/auth/email-verification/requests", { email }),
    ]);
    const replacements = (await Promise.all(
      responses.map((response) => response.json()),
    )) as AuthChallengeResponse[];

    assert.deepEqual(responses.map((response) => response.status), [202, 202]);
    assert.equal(replacements[0]?.challengeId, replacements[1]?.challengeId);
    assert.notEqual(replacements[0]?.challengeId, challenge.challengeId);
    assert.equal(emailSender.messages.length, messageCount + 1);
  } finally {
    await db.delete(users).where(eq(users.email, email));
  }
});

test("concurrent password-reset completion consumes one grant only once", async () => {
  const email = `reset-grant-concurrency-${Date.now()}@example.com`;
  const password = "correct-horse-batter";
  const firstReplacement = "new-password-one";
  const secondReplacement = "new-password-two";

  try {
    await signUpAndVerify(app, email, password);
    const requestResponse = await postJson(
      app,
      "/v1/auth/password-reset/requests",
      { email },
    );
    assert.equal(requestResponse.status, 202);
    const challenge = (await requestResponse.json()) as AuthChallengeResponse;
    const code = emailSender.messages.at(-1)?.text.match(/\b\d{6}\b/)?.[0];
    assert.ok(code);
    const verification = await postJson(
      app,
      "/v1/auth/password-reset/verifications",
      { challengeId: challenge.challengeId, code },
    );
    assert.equal(verification.status, 200);
    const grant = (await verification.json()) as { resetGrant: string };

    const responses = await Promise.all([
      postJson(app, "/v1/auth/password-reset/completions", {
        resetGrant: grant.resetGrant,
        password: firstReplacement,
      }),
      postJson(app, "/v1/auth/password-reset/completions", {
        resetGrant: grant.resetGrant,
        password: secondReplacement,
      }),
    ]);
    assert.deepEqual(
      responses.map((response) => response.status).sort(),
      [200, 400],
    );

    const [user] = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    assert.ok(user);
    const acceptedPasswords = await Promise.all([
      verifyPassword(firstReplacement, user.passwordHash),
      verifyPassword(secondReplacement, user.passwordHash),
    ]);
    assert.equal(acceptedPasswords.filter(Boolean).length, 1);
  } finally {
    await db.delete(users).where(eq(users.email, email));
  }
});

after(async () => {
  await pool.end();
});

test("concurrent refresh rotation allows one success then revokes the reused family", async () => {
  const email = `refresh-concurrency-${Date.now()}@example.com`;
  const password = "correct-horse-batter";
  const barrier = createBarrier(2);
  const raceApp = createApp({
    emailSender,
    authConcurrency: { afterRefreshLookup: barrier.wait },
  });

  try {
    const session = await signUpAndVerify(raceApp, email, password);
    const input = { refreshToken: session.tokens.refreshToken };
    const responses = await Promise.all([
      postJson(raceApp, "/v1/auth/refresh", input),
      postJson(raceApp, "/v1/auth/refresh", input),
    ]);

    assert.equal(barrier.calls, 2);
    assert.deepEqual(
      responses.map((response) => response.status).sort(),
      [200, 403],
    );
    const activeTokens = await db
      .select({ id: refreshTokens.id })
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.userId, session.user.id),
          isNull(refreshTokens.revokedAt),
        ),
      );
    assert.equal(activeTokens.length, 0);
  } finally {
    await db.delete(users).where(eq(users.email, email));
  }
});

test("account deletion serializes against an observed refresh lookup", async () => {
  const email = `delete-refresh-concurrency-${Date.now()}@example.com`;
  const password = "correct-horse-batter";
  const deletionGate = createGate();
  const refreshGate = createGate();
  const raceApp = createApp({
    emailSender,
    authConcurrency: {
      afterAccountDeletionLock: deletionGate.wait,
      afterRefreshLookup: refreshGate.wait,
    },
  });
  let userId: string | undefined;

  try {
    const session = await signUpAndVerify(raceApp, email, password);
    userId = session.user.id;
    const deletionPromise = raceApp.request("/v1/users/me", {
      method: "DELETE",
      headers: { authorization: `Bearer ${session.tokens.accessToken}` },
    });
    await waitForGate(deletionGate.entered);

    const refreshPromise = postJson(raceApp, "/v1/auth/refresh", {
      refreshToken: session.tokens.refreshToken,
    });
    await waitForGate(refreshGate.entered);

    deletionGate.release();
    const deletionResponse = await deletionPromise;
    assert.equal(deletionResponse.status, 200);

    refreshGate.release();
    const refreshResponse = await refreshPromise;
    assert.equal(refreshResponse.status, 403);

    const activeTokens = await db
      .select({ id: refreshTokens.id })
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.userId, userId),
          isNull(refreshTokens.revokedAt),
        ),
      );
    assert.equal(activeTokens.length, 0);
  } finally {
    deletionGate.release();
    refreshGate.release();
    if (userId) {
      await db.delete(users).where(eq(users.id, userId));
    } else {
      await db.delete(users).where(eq(users.email, email));
    }
  }
});

test("password reset and account deletion share account-first lock order", async () => {
  const email = `reset-delete-concurrency-${Date.now()}@example.com`;
  const password = "correct-horse-batter";
  const resetGate = createGate();
  const raceApp = createApp({
    emailSender,
    authConcurrency: {
      afterPasswordResetAccountLock: resetGate.wait,
    },
  });
  let userId: string | undefined;

  try {
    const session = await signUpAndVerify(raceApp, email, password);
    userId = session.user.id;
    const requestResponse = await postJson(
      raceApp,
      "/v1/auth/password-reset/requests",
      { email },
    );
    assert.equal(requestResponse.status, 202);
    const challenge = (await requestResponse.json()) as AuthChallengeResponse;
    const code = emailSender.messages.at(-1)?.text.match(/\b\d{6}\b/)?.[0];
    assert.ok(code);
    const verification = await postJson(
      raceApp,
      "/v1/auth/password-reset/verifications",
      { challengeId: challenge.challengeId, code },
    );
    assert.equal(verification.status, 200);
    const grant = (await verification.json()) as { resetGrant: string };

    const resetPromise = postJson(
      raceApp,
      "/v1/auth/password-reset/completions",
      { resetGrant: grant.resetGrant, password: "replacement-password" },
    );
    await waitForGate(resetGate.entered);

    const deletionPromise = raceApp.request("/v1/users/me", {
      method: "DELETE",
      headers: { authorization: `Bearer ${session.tokens.accessToken}` },
    });
    resetGate.release();

    const resetResponse = await resetPromise;
    const deletionResponse = await deletionPromise;
    assert.equal(resetResponse.status, 200);
    assert.equal(deletionResponse.status, 200);

    const [deletedUser] = await db
      .select({ accountStatus: users.accountStatus })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    assert.equal(deletedUser?.accountStatus, "deleted");
  } finally {
    resetGate.release();
    if (userId) {
      await db.delete(users).where(eq(users.id, userId));
    } else {
      await db.delete(users).where(eq(users.email, email));
    }
  }
});
