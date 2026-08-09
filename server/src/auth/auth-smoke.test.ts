import assert from "node:assert/strict";
import { after, test } from "node:test";

import { eq } from "drizzle-orm";

import { createApp } from "../app";
import { hashRefreshToken } from "../auth/tokens";
import type {
  AuthChallengeResponse,
  AuthSessionResponse as AuthResponse,
  AuthTokens,
} from "../contracts/auth";
import type {
  PrivateProfileResponse as ProfileResponse,
  UpdateProfileResponse,
} from "../contracts/profiles";
import { db, pool } from "../db/client";
import { InMemoryEmailSender } from "../email/emailSender";
import { profiles, refreshTokens, users } from "../db/schema";
import {
  type ApiErrorEnvelope,
  type NonValidationErrorCode,
} from "../http/errors";
import { REQUEST_ID_HEADER } from "../http/requestId";
import { isUsersEmailUniqueViolation } from "../routes/auth";

process.env.JWT_SECRET ??= "test-secret";

const emailSender = new InMemoryEmailSender();
const app = createApp({ emailSender });

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Sends JSON requests through the real application route tree.
const postJsonResponse = (path: string, body: object) =>
  app.request(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

// Parses a successful JSON response after checking its status.
const postJson = async <T>(path: string, body: object, expectedStatus: number) => {
  const response = await postJsonResponse(path, body);

  assert.equal(response.status, expectedStatus);
  return (await response.json()) as T;
};

// Registers and confirms a user through the mandatory email challenge.
const signUpAndVerify = async (input: {
  email: string;
  password: string;
  displayName?: string;
}) => {
  const challenge = await postJson<AuthChallengeResponse>(
    "/v1/auth/signup",
    input,
    201,
  );
  const code = emailSender.messages.at(-1)?.text.match(/\b\d{6}\b/)?.[0];
  assert.ok(code);

  return postJson<AuthResponse>(
    "/v1/auth/email-verification/confirmations",
    { challengeId: challenge.challengeId, code },
    200,
  );
};

// Parses one authenticated JSON response after checking its status.
const getJson = async <T>(path: string, accessToken: string, expectedStatus: number) => {
  const response = await app.request(path, {
    headers: { authorization: `Bearer ${accessToken}` },
  });

  assert.equal(response.status, expectedStatus);
  return (await response.json()) as T;
};

// Verifies a database-backed failure uses the complete shared envelope.
const assertErrorResponse = async (
  response: Response,
  expected: {
    status: number;
    code: NonValidationErrorCode;
    message: string;
  },
) => {
  const requestId = response.headers.get(REQUEST_ID_HEADER);
  const body = (await response.json()) as ApiErrorEnvelope;

  assert.equal(response.status, expected.status);
  assert.match(requestId ?? "", UUID_PATTERN);
  assert.deepEqual(body, {
    error: {
      code: expected.code,
      message: expected.message,
      requestId,
    },
  });
};

after(async () => {
  await pool.end();
});

test("auth and profile endpoints work against local Postgres", async (t) => {
  try {
    await pool.query("select 1");
  } catch {
    t.skip("local Postgres is unavailable");
    return;
  }

  const email = `smoke-${Date.now()}@example.com`;
  const password = "correct-horse-batter";

  await db.delete(users).where(eq(users.email, email));

  try {
    const signup = await signUpAndVerify({
      email,
      password,
      displayName: "Smoke Tester",
    });

    assert.equal(signup.user.email, email);
    assert.ok(signup.tokens.accessToken);
    assert.ok(signup.tokens.refreshToken);
    assert.deepEqual(Object.keys(signup.tokens).sort(), [
      "accessToken",
      "refreshToken",
    ]);
    const [persistedUser] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    const [persistedProfile] = await db
      .select({ userId: profiles.userId, displayName: profiles.displayName })
      .from(profiles)
      .where(eq(profiles.userId, signup.user.id))
      .limit(1);
    const [persistedRefreshToken] = await db
      .select({ userId: refreshTokens.userId })
      .from(refreshTokens)
      .where(
        eq(
          refreshTokens.tokenHash,
          hashRefreshToken(signup.tokens.refreshToken),
        ),
      )
      .limit(1);

    assert.deepEqual(persistedUser, { id: signup.user.id, email });
    assert.deepEqual(persistedProfile, {
      userId: signup.user.id,
      displayName: "Smoke Tester",
    });
    assert.deepEqual(persistedRefreshToken, { userId: signup.user.id });

    const login = await postJson<AuthResponse>("/v1/auth/login", { email, password }, 200);
    assert.equal(login.user.id, signup.user.id);
    assert.deepEqual(Object.keys(login.tokens).sort(), [
      "accessToken",
      "refreshToken",
    ]);

    const profile = await getJson<ProfileResponse>(
      "/v1/profiles/me",
      login.tokens.accessToken,
      200,
    );
    assert.equal(profile.profile.email, email);
    assert.equal(profile.profile.displayName, "Smoke Tester");

    const updateResponse = await app.request("/v1/profiles/me", {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${login.tokens.accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        displayName: "Updated Tester",
        bio: null,
        avatarImageUrl: null,
      }),
    });
    const updated = (await updateResponse.json()) as UpdateProfileResponse;

    assert.equal(updateResponse.status, 200);
    assert.deepEqual(updated, {
      profile: {
        displayName: "Updated Tester",
        bio: null,
        avatarImageUrl: null,
      },
    });

    const refreshed = await postJson<AuthTokens>(
      "/v1/auth/refresh",
      { refreshToken: login.tokens.refreshToken },
      200,
    );
    assert.ok(refreshed.accessToken);
    assert.ok(refreshed.refreshToken);
    assert.notEqual(refreshed.refreshToken, login.tokens.refreshToken);

    const logout = await postJson<{ ok: boolean }>(
      "/v1/auth/logout",
      { refreshToken: refreshed.refreshToken },
      200,
    );
    assert.equal(logout.ok, true);
  } finally {
    await db.delete(users).where(eq(users.email, email));
  }
});

test("duplicate signup returns the registered-email error envelope", async () => {
  const email = `api02-duplicate-${Date.now()}@example.com`;
  const password = "correct-horse-batter";

  try {
    await signUpAndVerify({ email, password, displayName: "Duplicate Tester" });

    const response = await postJsonResponse("/v1/auth/signup", {
      email,
      password,
      displayName: "Duplicate Tester",
    });

    await assertErrorResponse(response, {
      status: 409,
      code: "email_already_registered",
      message: "Email is already registered.",
    });

    const persistedUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email));
    assert.equal(persistedUsers.length, 1);
    const persistedUserId = persistedUsers[0]?.id;
    assert.ok(persistedUserId);

    const persistedProfiles = await db
      .select({ userId: profiles.userId })
      .from(profiles)
      .where(eq(profiles.userId, persistedUserId));
    const persistedRefreshTokens = await db
      .select({ id: refreshTokens.id })
      .from(refreshTokens)
      .where(eq(refreshTokens.userId, persistedUserId));

    assert.equal(persistedProfiles.length, 1);
    assert.equal(persistedRefreshTokens.length, 1);
  } finally {
    await db.delete(users).where(eq(users.email, email));
  }
});

test("database classifier accepts only the users email constraint", async () => {
  const email = `api02-constraint-${Date.now()}@example.com`;
  const password = "correct-horse-batter";

  try {
    const signup = await signUpAndVerify({
      email,
      password,
      displayName: "Constraint Tester",
    });

    let emailConflict: unknown;
    try {
      await db.insert(users).values({
        email,
        passwordHash: "constraint-test-only",
      });
    } catch (error) {
      emailConflict = error;
    }
    assert.ok(emailConflict);
    assert.equal(isUsersEmailUniqueViolation(emailConflict), true);

    let profileConflict: unknown;
    try {
      await db.insert(profiles).values({
        userId: signup.user.id,
        displayName: "Duplicate Profile",
      });
    } catch (error) {
      profileConflict = error;
    }
    assert.ok(profileConflict);
    assert.equal(isUsersEmailUniqueViolation(profileConflict), false);
  } finally {
    await db.delete(users).where(eq(users.email, email));
  }
});

test("wrong-password login returns the invalid-credentials envelope", async () => {
  const email = `api02-password-${Date.now()}@example.com`;
  const password = "correct-horse-batter";

  try {
    await signUpAndVerify({ email, password, displayName: "Password Tester" });

    const response = await postJsonResponse("/v1/auth/login", {
      email,
      password: "wrong-password",
    });

    await assertErrorResponse(response, {
      status: 401,
      code: "invalid_credentials",
      message: "Email or password is incorrect.",
    });
  } finally {
    await db.delete(users).where(eq(users.email, email));
  }
});

test("unknown refresh token returns the invalid-token envelope", async () => {
  const response = await postJsonResponse("/v1/auth/refresh", {
    refreshToken: `unknown-refresh-${Date.now()}`,
  });

  await assertErrorResponse(response, {
    status: 401,
    code: "invalid_refresh_token",
    message: "Refresh token is invalid.",
  });
});

test("expired refresh token returns the expired-token envelope", async () => {
  const email = `api02-expired-${Date.now()}@example.com`;
  const password = "correct-horse-batter";

  try {
    const signup = await signUpAndVerify({
      email,
      password,
      displayName: "Expired Tester",
    });

    await db
      .update(refreshTokens)
      .set({ expiresAt: new Date(0) })
      .where(
        eq(
          refreshTokens.tokenHash,
          hashRefreshToken(signup.tokens.refreshToken),
        ),
      );

    const response = await postJsonResponse("/v1/auth/refresh", {
      refreshToken: signup.tokens.refreshToken,
    });

    await assertErrorResponse(response, {
      status: 401,
      code: "refresh_token_expired",
      message: "Refresh token has expired.",
    });
  } finally {
    await db.delete(users).where(eq(users.email, email));
  }
});

test("reused refresh token returns the reuse-detected envelope", async () => {
  const email = `api02-reuse-${Date.now()}@example.com`;
  const password = "correct-horse-batter";

  try {
    const signup = await signUpAndVerify({
      email,
      password,
      displayName: "Reuse Tester",
    });

    await postJson<AuthTokens>(
      "/v1/auth/refresh",
      { refreshToken: signup.tokens.refreshToken },
      200,
    );
    const response = await postJsonResponse("/v1/auth/refresh", {
      refreshToken: signup.tokens.refreshToken,
    });

    await assertErrorResponse(response, {
      status: 403,
      code: "refresh_token_reuse_detected",
      message: "This session is no longer valid.",
    });
  } finally {
    await db.delete(users).where(eq(users.email, email));
  }
});

test("logout-revoked refresh detects reuse and invalidates active sessions", async () => {
  const email = `api02-logout-reuse-${Date.now()}@example.com`;
  const password = "correct-horse-batter";

  try {
    const signup = await signUpAndVerify({
      email,
      password,
      displayName: "Logout Reuse Tester",
    });
    const activeSession = await postJson<AuthResponse>(
      "/v1/auth/login",
      { email, password },
      200,
    );

    await postJson<{ ok: boolean }>(
      "/v1/auth/logout",
      { refreshToken: signup.tokens.refreshToken },
      200,
    );
    const replayResponse = await postJsonResponse("/v1/auth/refresh", {
      refreshToken: signup.tokens.refreshToken,
    });

    await assertErrorResponse(replayResponse, {
      status: 403,
      code: "refresh_token_reuse_detected",
      message: "This session is no longer valid.",
    });

    const [invalidatedSession] = await db
      .select({ revokedAt: refreshTokens.revokedAt })
      .from(refreshTokens)
      .where(
        eq(
          refreshTokens.tokenHash,
          hashRefreshToken(activeSession.tokens.refreshToken),
        ),
      )
      .limit(1);
    assert.ok(invalidatedSession?.revokedAt);

    const invalidatedResponse = await postJsonResponse("/v1/auth/refresh", {
      refreshToken: activeSession.tokens.refreshToken,
    });
    await assertErrorResponse(invalidatedResponse, {
      status: 403,
      code: "refresh_token_reuse_detected",
      message: "This session is no longer valid.",
    });
  } finally {
    await db.delete(users).where(eq(users.email, email));
  }
});

test("valid access token for a deleted profile returns not found", async () => {
  const email = `api02-profile-${Date.now()}@example.com`;
  const password = "correct-horse-batter";

  try {
    const signup = await signUpAndVerify({
      email,
      password,
      displayName: "Profile Tester",
    });

    await getJson<ProfileResponse>(
      "/v1/profiles/me",
      signup.tokens.accessToken,
      200,
    );
    await db.delete(profiles).where(eq(profiles.userId, signup.user.id));

    const response = await app.request("/v1/profiles/me", {
      headers: {
        authorization: `Bearer ${signup.tokens.accessToken}`,
      },
    });

    await assertErrorResponse(response, {
      status: 404,
      code: "resource_not_found",
      message: "The requested resource was not found.",
    });

    const patchResponse = await app.request("/v1/profiles/me", {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${signup.tokens.accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ displayName: "Missing Profile" }),
    });

    await assertErrorResponse(patchResponse, {
      status: 404,
      code: "resource_not_found",
      message: "The requested resource was not found.",
    });
  } finally {
    await db.delete(users).where(eq(users.email, email));
  }
});
