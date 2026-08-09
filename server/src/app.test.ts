import assert from "node:assert/strict";
import { test } from "node:test";

import { app } from "./app";
import { createAccessToken } from "./auth/tokens";
import type { ApiErrorEnvelope } from "./http/errors";
import { REQUEST_ID_HEADER } from "./http/requestId";

process.env.JWT_SECRET ??= "test-secret";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

test("GET /health stays unversioned", async () => {
  const healthResponse = await app.request("/health");
  const versionedHealthResponse = await app.request("/v1/health");
  const versionedHealthBody =
    (await versionedHealthResponse.json()) as ApiErrorEnvelope;

  assert.equal(healthResponse.status, 200);
  assert.deepEqual(await healthResponse.json(), { ok: true });
  assert.equal(versionedHealthResponse.status, 404);
  assert.deepEqual(versionedHealthBody, {
    error: {
      code: "route_not_found",
      message: "The requested endpoint was not found.",
      requestId: versionedHealthResponse.headers.get(REQUEST_ID_HEADER),
    },
  });
});

test("every response receives a unique server request ID", async () => {
  const first = await app.request("/health");
  const second = await app.request("/health");

  const firstId = first.headers.get("X-Request-Id");
  const secondId = second.headers.get("X-Request-Id");

  assert.match(firstId ?? "", UUID_PATTERN);
  assert.match(secondId ?? "", UUID_PATTERN);
  assert.notEqual(firstId, secondId);
  assert.deepEqual(await first.json(), { ok: true });
});

test("client request IDs are ignored and overwritten", async () => {
  const response = await app.request("/health", {
    headers: { "X-Request-Id": "client-controlled" },
  });

  assert.match(response.headers.get("X-Request-Id") ?? "", UUID_PATTERN);
  assert.notEqual(response.headers.get("X-Request-Id"), "client-controlled");
});

test("current database-free route failures use the shared error envelope", async (t) => {
  const profileAccessToken = await createAccessToken(
    "00000000-0000-4000-8000-000000000001",
  );
  const cases = [
    {
      path: "/v1/auth/login",
      method: "POST",
      body: "{}",
      status: 400,
      code: "validation_failed",
      message: "Some fields need attention.",
      fieldErrors: {
        email: ["Invalid input: expected string, received undefined"],
        password: ["Invalid input: expected string, received undefined"],
      },
    },
    {
      path: "/v1/auth/login",
      method: "POST",
      body: "{",
      status: 400,
      code: "malformed_request",
      message: "The request could not be read.",
    },
    {
      path: "/v1/profiles/me",
      method: "GET",
      status: 401,
      code: "authentication_required",
      message: "Authentication is required.",
    },
    {
      path: "/v1/profiles/me",
      method: "GET",
      authorization: "Bearer invalid-access-token",
      status: 401,
      code: "invalid_access_token",
      message: "Authentication is invalid or expired.",
    },
    {
      path: "/v1/auth/refresh",
      method: "POST",
      body: "{}",
      status: 400,
      code: "validation_failed",
      message: "Some fields need attention.",
      fieldErrors: {
        refreshToken: [
          "Invalid input: expected string, received undefined",
        ],
      },
    },
    {
      path: "/v1/auth/logout",
      method: "POST",
      body: "{}",
      status: 400,
      code: "validation_failed",
      message: "Some fields need attention.",
      fieldErrors: {
        refreshToken: [
          "Invalid input: expected string, received undefined",
        ],
      },
    },
    {
      path: "/v1/profiles/me",
      method: "PATCH",
      authorization: `Bearer ${profileAccessToken}`,
      body: JSON.stringify({ displayName: "" }),
      status: 401,
      code: "invalid_access_token",
      message: "Authentication is invalid or expired.",
    },
    {
      path: "/v1/recipes/recipe-id",
      method: "GET",
      status: 501,
      code: "not_implemented",
      message: "This operation is not available yet.",
    },
    {
      path: "/v1/recipes",
      method: "POST",
      body: "{}",
      status: 501,
      code: "not_implemented",
      message: "This operation is not available yet.",
    },
    {
      path: "/v1/images/upload-url",
      method: "POST",
      body: "{}",
      status: 501,
      code: "not_implemented",
      message: "This operation is not available yet.",
    },
    {
      path: "/v1/reports",
      method: "POST",
      body: "{}",
      status: 501,
      code: "not_implemented",
      message: "This operation is not available yet.",
    },
    {
      path: "/v1/blocks",
      method: "POST",
      body: "{}",
      status: 501,
      code: "not_implemented",
      message: "This operation is not available yet.",
    },
    {
      path: "/recipes/legacy-recipe-id",
      method: "GET",
      status: 501,
      code: "not_implemented",
      message: "This operation is not available yet.",
    },
  ] as const;

  for (const routeCase of cases) {
    const label =
      `${routeCase.method} ${routeCase.path} returns ${routeCase.code}`;

    await t.test(label, async () => {
      const response = await app.request(routeCase.path, {
        method: routeCase.method,
        headers: {
          ...("body" in routeCase
            ? { "content-type": "application/json" }
            : {}),
          ...("authorization" in routeCase
            ? { authorization: routeCase.authorization }
            : {}),
        },
        body: "body" in routeCase ? routeCase.body : undefined,
      });
      const body = (await response.json()) as ApiErrorEnvelope;
      const requestId = response.headers.get(REQUEST_ID_HEADER);

      assert.equal(response.status, routeCase.status);
      assert.match(requestId ?? "", UUID_PATTERN);
      assert.equal(body.error.code, routeCase.code);
      assert.equal(body.error.message, routeCase.message);
      assert.equal(body.error.requestId, requestId);
      assert.equal(
        "fieldErrors" in body.error,
        routeCase.code === "validation_failed",
      );

      if (
        body.error.code === "validation_failed" &&
        "fieldErrors" in routeCase
      ) {
        assert.deepEqual(body.error.fieldErrors, routeCase.fieldErrors);
      }
    });
  }
});

test("all existing application route families are mounted under /v1", async () => {
  const cases: ReadonlyArray<{
    path: string;
    method: "GET" | "POST";
    expectedStatus: number;
  }> = [
    { path: "/v1/auth/login", method: "POST", expectedStatus: 400 },
    { path: "/v1/profiles/me", method: "GET", expectedStatus: 401 },
    { path: "/v1/recipes", method: "GET", expectedStatus: 200 },
    { path: "/v1/images/upload-url", method: "POST", expectedStatus: 501 },
    { path: "/v1/favourites", method: "GET", expectedStatus: 200 },
    { path: "/v1/reports", method: "POST", expectedStatus: 501 },
    { path: "/v1/blocks", method: "POST", expectedStatus: 501 },
  ];

  for (const routeCase of cases) {
    const response = await app.request(routeCase.path, {
      method: routeCase.method,
      headers: { "content-type": "application/json" },
      body: routeCase.method === "POST" ? "{}" : undefined,
    });

    assert.equal(
      response.status,
      routeCase.expectedStatus,
      `${routeCase.method} ${routeCase.path}`,
    );
  }
});

test("legacy auth and profile routes retire after mobile migration", async () => {
  const recipesResponse = await app.request("/recipes");
  const loginResponse = await app.request("/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  const profileResponse = await app.request("/profiles/me");

  assert.equal(recipesResponse.status, 200);
  assert.equal(loginResponse.status, 404);
  assert.equal(profileResponse.status, 404);
});
