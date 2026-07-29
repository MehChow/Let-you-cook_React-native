import assert from "node:assert/strict";
import { test } from "node:test";

import { app } from "./app";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

test("GET /health stays unversioned", async () => {
  const healthResponse = await app.request("/health");
  const versionedHealthResponse = await app.request("/v1/health");

  assert.equal(healthResponse.status, 200);
  assert.deepEqual(await healthResponse.json(), { ok: true });
  assert.equal(versionedHealthResponse.status, 404);
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

test("legacy application routes remain available during migration", async () => {
  const recipesResponse = await app.request("/recipes");
  const loginResponse = await app.request("/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });

  assert.equal(recipesResponse.status, 200);
  assert.equal(loginResponse.status, 400);
});
