import assert from "node:assert/strict";
import { after, test } from "node:test";

import { and, eq, isNull } from "drizzle-orm";

import { createApp } from "../app";
import type {
  AuthChallengeResponse,
  AuthSessionResponse,
  PasswordResetGrantResponse,
} from "../contracts/auth";
import { db, pool } from "../db/client";
import { authChallenges, refreshTokens, users } from "../db/schema";
import { InMemoryEmailSender } from "../email/emailSender";

process.env.JWT_SECRET ??= "test-jwt-secret";

// Sends JSON through the real password-reset route tree.
const postJsonResponse = (
  app: ReturnType<typeof createApp>,
  path: string,
  body: object,
) =>
  app.request(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

// Parses one successful password-reset response at its expected status.
const postJson = async <T>(
  app: ReturnType<typeof createApp>,
  path: string,
  body: object,
  expectedStatus: number,
) => {
  const response = await postJsonResponse(app, path, body);
  assert.equal(response.status, expectedStatus);
  return (await response.json()) as T;
};

// Extracts the latest OTP exposed only by the in-memory test fake.
const readLatestCode = (sender: InMemoryEmailSender) => {
  const code = sender.messages.at(-1)?.text.match(/\b\d{6}\b/)?.[0];
  assert.ok(code);
  return code;
};

// Creates a verified user and returns its first session.
const registerVerifiedUser = async (
  app: ReturnType<typeof createApp>,
  sender: InMemoryEmailSender,
  email: string,
  password: string,
) => {
  const challenge = await postJson<AuthChallengeResponse>(
    app,
    "/v1/auth/signup",
    { email, password },
    201,
  );
  return postJson<AuthSessionResponse>(
    app,
    "/v1/auth/email-verification/confirmations",
    { challengeId: challenge.challengeId, code: readLatestCode(sender) },
    200,
  );
};

after(async () => {
  await pool.end();
});

test("password reset issues a short grant, changes password, and revokes sessions", async (t) => {
  try {
    await pool.query("select 1");
  } catch {
    t.skip("local Postgres is unavailable");
    return;
  }

  const sender = new InMemoryEmailSender();
  const app = createApp({ emailSender: sender });
  const email = `password-reset-${Date.now()}@example.com`;
  const oldPassword = "correct-horse-batter";
  const newPassword = "new-correct-horse";

  try {
    const firstSession = await registerVerifiedUser(app, sender, email, oldPassword);
    const secondSession = await postJson<AuthSessionResponse>(
      app,
      "/v1/auth/login",
      { email, password: oldPassword },
      200,
    );

    const request = await postJson<AuthChallengeResponse>(
      app,
      "/v1/auth/password-reset/requests",
      { email: email.toUpperCase() },
      202,
    );
    const code = readLatestCode(sender);
    const [challenge] = await db
      .select()
      .from(authChallenges)
      .where(eq(authChallenges.id, request.challengeId))
      .limit(1);
    assert.equal(challenge?.purpose, "password_reset");
    assert.notEqual(challenge?.codeHash, code);
    assert.equal(challenge?.targetHash.includes(email), false);

    const verification = await postJson<PasswordResetGrantResponse>(
      app,
      "/v1/auth/password-reset/verifications",
      { challengeId: request.challengeId, code },
      200,
    );
    assert.ok(verification.resetGrant);
    assert.equal("accessToken" in verification, false);
    assert.ok(Date.parse(verification.expiresAt) > Date.now());

    const completion = await postJson<{ ok: true }>(
      app,
      "/v1/auth/password-reset/completions",
      { resetGrant: verification.resetGrant, password: newPassword },
      200,
    );
    assert.deepEqual(completion, { ok: true });

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    assert.ok(user);
    const activeTokens = await db
      .select({ id: refreshTokens.id })
      .from(refreshTokens)
      .where(and(eq(refreshTokens.userId, user.id), isNull(refreshTokens.revokedAt)));
    assert.equal(activeTokens.length, 0);

    const oldRefresh = await postJsonResponse(app, "/v1/auth/refresh", {
      refreshToken: secondSession.tokens.refreshToken,
    });
    assert.equal(oldRefresh.status, 403);

    const oldLogin = await postJsonResponse(app, "/v1/auth/login", {
      email,
      password: oldPassword,
    });
    assert.equal(oldLogin.status, 401);
    const newLogin = await postJson<AuthSessionResponse>(
      app,
      "/v1/auth/login",
      { email, password: newPassword },
      200,
    );
    assert.equal(newLogin.user.email, email);

    const replay = await postJsonResponse(
      app,
      "/v1/auth/password-reset/completions",
      { resetGrant: verification.resetGrant, password: "another-password" },
    );
    assert.equal(replay.status, 400);
    assert.equal((await replay.json()).error.code, "invalid_password_reset_grant");

    assert.notEqual(firstSession.tokens.refreshToken, secondSession.tokens.refreshToken);
  } finally {
    await db.delete(users).where(eq(users.email, email));
  }
});

test("password-reset request stays generic for an unknown account", async (t) => {
  try {
    await pool.query("select 1");
  } catch {
    t.skip("local Postgres is unavailable");
    return;
  }

  const sender = new InMemoryEmailSender();
  const app = createApp({ emailSender: sender });
  const response = await postJson<AuthChallengeResponse>(
    app,
    "/v1/auth/password-reset/requests",
    { email: `unknown-reset-${Date.now()}@example.com` },
    202,
  );

  assert.equal(response.ok, true);
  assert.equal(sender.messages.length, 0);
  await db.delete(authChallenges).where(eq(authChallenges.id, response.challengeId));
});

test("password-reset challenge enforces attempt and grant expiry", async (t) => {
  try {
    await pool.query("select 1");
  } catch {
    t.skip("local Postgres is unavailable");
    return;
  }

  const sender = new InMemoryEmailSender();
  const app = createApp({ emailSender: sender });
  const email = `reset-limits-${Date.now()}@example.com`;

  try {
    await registerVerifiedUser(app, sender, email, "correct-horse-batter");
    const challenge = await postJson<AuthChallengeResponse>(
      app,
      "/v1/auth/password-reset/requests",
      { email },
      202,
    );
    const correctCode = readLatestCode(sender);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const invalid = await postJsonResponse(
        app,
        "/v1/auth/password-reset/verifications",
        { challengeId: challenge.challengeId, code: "000000" },
      );
      assert.equal(invalid.status, 400);
    }
    const locked = await postJsonResponse(
      app,
      "/v1/auth/password-reset/verifications",
      { challengeId: challenge.challengeId, code: correctCode },
    );
    assert.equal(locked.status, 400);

    await db
      .update(authChallenges)
      .set({ consumedAt: null, attemptCount: 0, lastSentAt: new Date(0) })
      .where(eq(authChallenges.id, challenge.challengeId));
    const replacement = await postJson<AuthChallengeResponse>(
      app,
      "/v1/auth/password-reset/requests",
      { email },
      202,
    );
    const grant = await postJson<PasswordResetGrantResponse>(
      app,
      "/v1/auth/password-reset/verifications",
      { challengeId: replacement.challengeId, code: readLatestCode(sender) },
      200,
    );
    await db
      .update(authChallenges)
      .set({ grantExpiresAt: new Date(0) })
      .where(eq(authChallenges.id, replacement.challengeId));

    const expiredGrant = await postJsonResponse(
      app,
      "/v1/auth/password-reset/completions",
      { resetGrant: grant.resetGrant, password: "new-password-123" },
    );
    assert.equal(expiredGrant.status, 400);
  } finally {
    await db.delete(users).where(eq(users.email, email));
  }
});
