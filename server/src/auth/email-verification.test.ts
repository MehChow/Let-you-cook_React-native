import assert from "node:assert/strict";
import { after, test } from "node:test";

import { eq } from "drizzle-orm";

import { createApp } from "../app";
import type {
  AuthChallengeResponse,
  AuthSessionResponse,
} from "../contracts/auth";
import { db, pool } from "../db/client";
import { authChallenges, refreshTokens, users } from "../db/schema";
import { InMemoryEmailSender } from "../email/emailSender";

process.env.AUTH_CHALLENGE_SECRET ??= "test-auth-challenge-secret";
process.env.JWT_SECRET ??= "test-jwt-secret";

// Sends a JSON request through an app with an injected email fake.
const postJson = (app: ReturnType<typeof createApp>, path: string, body: object) =>
  app.request(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

// Reads the sole six-digit code intentionally exposed by the test fake.
const readLatestCode = (sender: InMemoryEmailSender) => {
  const text = sender.messages.at(-1)?.text ?? "";
  const code = text.match(/\b\d{6}\b/)?.[0];
  assert.ok(code);
  return code;
};

after(async () => {
  await pool.end();
});

test("signup requires email confirmation before issuing the first session", async (t) => {
  try {
    await pool.query("select 1");
  } catch {
    t.skip("local Postgres is unavailable");
    return;
  }

  const sender = new InMemoryEmailSender();
  const app = createApp({ emailSender: sender });
  const email = `verification-${Date.now()}@example.com`;
  const password = "correct-horse-batter";

  try {
    const signupResponse = await postJson(app, "/v1/auth/signup", {
      email,
      password,
      displayName: "Verification Tester",
    });
    const signup = (await signupResponse.json()) as AuthChallengeResponse;

    assert.equal(signupResponse.status, 201);
    assert.equal(signup.ok, true);
    assert.match(signup.challengeId, /^[0-9a-f-]{36}$/i);
    assert.equal(sender.messages.length, 1);
    assert.equal(sender.messages[0]?.to, email);
    const code = readLatestCode(sender);

    const [persistedUser] = await db
      .select({ id: users.id, emailVerifiedAt: users.emailVerifiedAt })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    assert.ok(persistedUser);
    assert.equal(persistedUser.emailVerifiedAt, null);
    assert.equal(
      (await db.select().from(refreshTokens).where(eq(refreshTokens.userId, persistedUser.id)))
        .length,
      0,
    );

    const [persistedChallenge] = await db
      .select()
      .from(authChallenges)
      .where(eq(authChallenges.id, signup.challengeId))
      .limit(1);
    assert.ok(persistedChallenge);
    assert.notEqual(persistedChallenge.codeHash, code);
    assert.equal(persistedChallenge.targetHash.includes(email), false);

    const loginResponse = await postJson(app, "/v1/auth/login", { email, password });
    assert.equal(loginResponse.status, 403);
    assert.equal((await loginResponse.json()).error.code, "email_verification_required");

    const confirmationResponse = await postJson(
      app,
      "/v1/auth/email-verification/confirmations",
      { challengeId: signup.challengeId, code },
    );
    const session = (await confirmationResponse.json()) as AuthSessionResponse;
    assert.equal(confirmationResponse.status, 200);
    assert.equal(session.user.id, persistedUser.id);
    assert.ok(session.tokens.accessToken);
    assert.ok(session.tokens.refreshToken);

    const [verifiedUser] = await db
      .select({ emailVerifiedAt: users.emailVerifiedAt })
      .from(users)
      .where(eq(users.id, persistedUser.id))
      .limit(1);
    assert.ok(verifiedUser?.emailVerifiedAt);

    const replayResponse = await postJson(
      app,
      "/v1/auth/email-verification/confirmations",
      { challengeId: signup.challengeId, code },
    );
    assert.equal(replayResponse.status, 400);
    assert.equal((await replayResponse.json()).error.code, "invalid_auth_challenge");
  } finally {
    await db.delete(users).where(eq(users.email, email));
  }
});

test("verification resend enforces cooldown and invalidates the replaced challenge", async (t) => {
  try {
    await pool.query("select 1");
  } catch {
    t.skip("local Postgres is unavailable");
    return;
  }

  const sender = new InMemoryEmailSender();
  const app = createApp({ emailSender: sender });
  const email = `resend-${Date.now()}@example.com`;

  try {
    const signupResponse = await postJson(app, "/v1/auth/signup", {
      email,
      password: "correct-horse-batter",
    });
    const first = (await signupResponse.json()) as AuthChallengeResponse;
    const firstCode = readLatestCode(sender);

    const coolingDown = await postJson(
      app,
      "/v1/auth/email-verification/requests",
      { email },
    );
    const unchanged = (await coolingDown.json()) as AuthChallengeResponse;
    assert.equal(coolingDown.status, 202);
    assert.equal(unchanged.challengeId, first.challengeId);
    assert.equal(sender.messages.length, 1);

    await db
      .update(authChallenges)
      .set({ lastSentAt: new Date(0) })
      .where(eq(authChallenges.id, first.challengeId));

    const resendResponse = await postJson(
      app,
      "/v1/auth/email-verification/requests",
      { email: email.toUpperCase() },
    );
    const replacement = (await resendResponse.json()) as AuthChallengeResponse;
    assert.equal(resendResponse.status, 202);
    assert.notEqual(replacement.challengeId, first.challengeId);
    assert.equal(sender.messages.length, 2);

    const replacedResponse = await postJson(
      app,
      "/v1/auth/email-verification/confirmations",
      { challengeId: first.challengeId, code: firstCode },
    );
    assert.equal(replacedResponse.status, 400);

    const replacementResponse = await postJson(
      app,
      "/v1/auth/email-verification/confirmations",
      { challengeId: replacement.challengeId, code: readLatestCode(sender) },
    );
    assert.equal(replacementResponse.status, 200);
  } finally {
    await db.delete(users).where(eq(users.email, email));
  }
});

test("verification requests do not reveal an unknown email", async (t) => {
  try {
    await pool.query("select 1");
  } catch {
    t.skip("local Postgres is unavailable");
    return;
  }

  const sender = new InMemoryEmailSender();
  const app = createApp({ emailSender: sender });
  const response = await postJson(
    app,
    "/v1/auth/email-verification/requests",
    { email: `unknown-${Date.now()}@example.com` },
  );
  const body = (await response.json()) as AuthChallengeResponse;

  assert.equal(response.status, 202);
  assert.equal(body.ok, true);
  assert.equal(sender.messages.length, 0);
  await db.delete(authChallenges).where(eq(authChallenges.id, body.challengeId));
});

test("five wrong verification attempts permanently invalidate a challenge", async (t) => {
  try {
    await pool.query("select 1");
  } catch {
    t.skip("local Postgres is unavailable");
    return;
  }

  const sender = new InMemoryEmailSender();
  const app = createApp({ emailSender: sender });
  const email = `attempts-${Date.now()}@example.com`;

  try {
    const signupResponse = await postJson(app, "/v1/auth/signup", {
      email,
      password: "correct-horse-batter",
    });
    const challenge = (await signupResponse.json()) as AuthChallengeResponse;
    const correctCode = readLatestCode(sender);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await postJson(
        app,
        "/v1/auth/email-verification/confirmations",
        { challengeId: challenge.challengeId, code: "000000" },
      );
      assert.equal(response.status, 400);
    }

    const lockedResponse = await postJson(
      app,
      "/v1/auth/email-verification/confirmations",
      { challengeId: challenge.challengeId, code: correctCode },
    );
    assert.equal(lockedResponse.status, 400);
    assert.equal((await lockedResponse.json()).error.code, "invalid_auth_challenge");
  } finally {
    await db.delete(users).where(eq(users.email, email));
  }
});

test("signup rolls back account creation when verification delivery fails", async (t) => {
  try {
    await pool.query("select 1");
  } catch {
    t.skip("local Postgres is unavailable");
    return;
  }

  const sender = new InMemoryEmailSender();
  sender.send = async () => {
    throw new Error("SMTP unavailable");
  };
  const app = createApp({ emailSender: sender });
  const email = `delivery-failure-${Date.now()}@example.com`;

  const response = await postJson(app, "/v1/auth/signup", {
    email,
    password: "correct-horse-batter",
  });

  assert.equal(response.status, 500);
  assert.equal((await db.select().from(users).where(eq(users.email, email))).length, 0);
});
