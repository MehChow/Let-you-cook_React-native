import assert from "node:assert/strict";
import { after, test } from "node:test";

import { eq } from "drizzle-orm";

import { createApp } from "../app";
import { db, pool } from "../db/client";
import { users } from "../db/schema";
import { InMemoryEmailSender } from "../email/emailSender";
import { REQUEST_ID_HEADER } from "../http/requestId";
import type { OperationalLogEvent } from "../observability/operationalLogger";

process.env.JWT_SECRET ??= "test-secret";

// Sends one JSON mutation through the real application boundary.
const postJson = (app: ReturnType<typeof createApp>, path: string, body: object) =>
  app.request(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

after(async () => {
  await pool.end();
});

test("auth rate limits isolate scopes and reset at the injected window boundary", async () => {
  let now = 1_000;
  const events: OperationalLogEvent[] = [];
  const app = createApp({
    emailSender: new InMemoryEmailSender(),
    logger: { write: (event) => events.push(event) },
    authRateLimit: {
      now: () => now,
      keyForRequest: async (_context, scope) => `test-client:${scope}`,
      policies: {
        password_reset_request: { limit: 2, windowMs: 1_000 },
      },
    },
  });
  const input = { email: "unknown@example.com" };

  const first = await postJson(app, "/v1/auth/password-reset/requests", input);
  const second = await postJson(app, "/v1/auth/password-reset/requests", input);
  const limited = await postJson(app, "/v1/auth/password-reset/requests", input);

  assert.equal(first.status, 202);
  assert.equal(second.status, 202);
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get("Retry-After"), "1");
  assert.deepEqual(await limited.json(), {
    error: {
      code: "rate_limited",
      message: "Too many requests. Try again later.",
      requestId: limited.headers.get(REQUEST_ID_HEADER),
    },
  });
  assert.deepEqual(events, [
    {
      classification: "rate_limited",
      level: "warn",
      method: "POST",
      requestId: limited.headers.get(REQUEST_ID_HEADER),
      routeScope: "auth",
      status: 429,
    },
  ]);
  assert.equal(JSON.stringify(events).includes(input.email), false);

  const login = await postJson(app, "/v1/auth/login", {
    email: "unknown@example.com",
    password: "password123",
  });
  assert.equal(login.status, 401);

  now = 2_000;
  const afterReset = await postJson(
    app,
    "/v1/auth/password-reset/requests",
    input,
  );
  assert.equal(afterReset.status, 202);
});

test("known and unknown reset accounts receive indistinguishable limits", async () => {
  const knownEmail = `known-limit-${Date.now()}@example.com`;
  const unknownEmail = `unknown-limit-${Date.now()}@example.com`;
  const app = createApp({
    emailSender: new InMemoryEmailSender(),
    authRateLimit: {
      now: () => 5_000,
      policies: {
        password_reset_request: { limit: 1, windowMs: 60_000 },
      },
    },
  });

  try {
    await db.insert(users).values({
      email: knownEmail,
      passwordHash: "test-only-unusable",
      emailVerifiedAt: new Date(0),
    });

    const knownFirst = await postJson(app, "/v1/auth/password-reset/requests", {
      email: knownEmail,
    });
    const knownLimited = await postJson(
      app,
      "/v1/auth/password-reset/requests",
      { email: knownEmail },
    );
    const unknownFirst = await postJson(
      app,
      "/v1/auth/password-reset/requests",
      { email: unknownEmail },
    );
    const unknownLimited = await postJson(
      app,
      "/v1/auth/password-reset/requests",
      { email: unknownEmail },
    );

    assert.equal(knownFirst.status, 202);
    assert.equal(unknownFirst.status, 202);
    assert.equal(knownLimited.status, 429);
    assert.equal(unknownLimited.status, 429);
    assert.equal(knownLimited.headers.get("Retry-After"), "60");
    assert.equal(unknownLimited.headers.get("Retry-After"), "60");
    const knownBody = (await knownLimited.json()) as { error: { code: string; message: string } };
    const unknownBody = (await unknownLimited.json()) as {
      error: { code: string; message: string };
    };
    assert.deepEqual(
      { code: knownBody.error.code, message: knownBody.error.message },
      { code: unknownBody.error.code, message: unknownBody.error.message },
    );
  } finally {
    await db.delete(users).where(eq(users.email, knownEmail));
  }
});

test("case-sensitive refresh secrets use distinct limiter keys", async () => {
  const app = createApp({
    emailSender: new InMemoryEmailSender(),
    authRateLimit: {
      now: () => 10_000,
      policies: { refresh: { limit: 1, windowMs: 60_000 } },
    },
  });

  const upper = await postJson(app, "/v1/auth/refresh", {
    refreshToken: "CaseSensitiveToken",
  });
  const lower = await postJson(app, "/v1/auth/refresh", {
    refreshToken: "casesensitivetoken",
  });

  assert.equal(upper.status, 401);
  assert.equal(lower.status, 401);
});
