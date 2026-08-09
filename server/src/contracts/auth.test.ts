import assert from "node:assert/strict";
import { test } from "node:test";

import {
  authChallengeConfirmationSchema,
  authChallengeRequestSchema,
  authChallengeResponseSchema,
  authCredentialsSchema,
  authSessionResponseSchema,
  authTokensSchema,
  logoutResponseSchema,
  refreshTokenInputSchema,
  signUpInputSchema,
} from "./auth";

const validUser = {
  id: "f6822e40-7c3a-40ec-a77f-c3291888dc0c",
  email: "cook@example.com",
};

const validTokens = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
};

test("auth request schemas preserve current normalization and stripping", () => {
  assert.deepEqual(
    authCredentialsSchema.parse({
      email: "COOK@EXAMPLE.COM",
      password: "password",
      ignored: true,
    }),
    {
      email: "cook@example.com",
      password: "password",
    },
  );
  assert.deepEqual(
    signUpInputSchema.parse({
      email: "COOK@EXAMPLE.COM",
      password: "password",
      displayName: "Cook",
    }),
    {
      email: "cook@example.com",
      password: "password",
      displayName: "Cook",
    },
  );
  assert.deepEqual(refreshTokenInputSchema.parse({
    refreshToken: "opaque",
    ignored: true,
  }), {
    refreshToken: "opaque",
  });
});

test("auth request schemas reject invalid current inputs", () => {
  assert.equal(
    authCredentialsSchema.safeParse({
      email: "not-an-email",
      password: "password",
    }).success,
    false,
  );
  assert.equal(
    authCredentialsSchema.safeParse({
      email: "cook@example.com",
      password: "short",
    }).success,
    false,
  );
  assert.equal(
    refreshTokenInputSchema.safeParse({ refreshToken: "" }).success,
    false,
  );
});

test("auth session response accepts only the public user and token DTOs", () => {
  const valid = { user: validUser, tokens: validTokens };

  assert.deepEqual(authSessionResponseSchema.parse(valid), valid);
  assert.equal(
    authSessionResponseSchema.safeParse({
      user: { ...validUser, passwordHash: "private" },
      tokens: validTokens,
    }).success,
    false,
  );
  assert.equal(
    authSessionResponseSchema.safeParse({
      user: validUser,
      tokens: { ...validTokens, refreshTokenId: validUser.id },
    }).success,
    false,
  );
  assert.equal(
    authSessionResponseSchema.safeParse({
      user: { ...validUser, id: "not-a-uuid" },
      tokens: validTokens,
    }).success,
    false,
  );
});

test("token and logout responses use strict current shapes", () => {
  assert.deepEqual(authTokensSchema.parse(validTokens), validTokens);
  assert.equal(
    authTokensSchema.safeParse({ ...validTokens, accessToken: "" }).success,
    false,
  );
  assert.deepEqual(logoutResponseSchema.parse({ ok: true }), { ok: true });
  assert.equal(
    logoutResponseSchema.safeParse({ ok: true, revokedCount: 1 }).success,
    false,
  );
});

test("email challenge contracts normalize requests and reject malformed codes", () => {
  assert.deepEqual(
    authChallengeRequestSchema.parse({ email: " COOK@EXAMPLE.COM " }),
    { email: "cook@example.com" },
  );
  assert.deepEqual(
    authChallengeConfirmationSchema.parse({
      challengeId: validUser.id,
      code: "123456",
    }),
    { challengeId: validUser.id, code: "123456" },
  );
  assert.equal(
    authChallengeConfirmationSchema.safeParse({
      challengeId: validUser.id,
      code: "12345",
    }).success,
    false,
  );
});

test("challenge responses expose only resumable public state", () => {
  const response = {
    ok: true,
    challengeId: validUser.id,
    expiresAt: "2026-08-09T10:10:00.000Z",
    resendAvailableAt: "2026-08-09T10:01:00.000Z",
  } as const;

  assert.deepEqual(authChallengeResponseSchema.parse(response), response);
  assert.equal(
    authChallengeResponseSchema.safeParse({ ...response, code: "123456" }).success,
    false,
  );
});
