import assert from "node:assert/strict";
import { test } from "node:test";

import { app } from "./app";

test("GET /health stays unversioned", async () => {
  const healthResponse = await app.request("/health");
  const versionedHealthResponse = await app.request("/v1/health");

  assert.equal(healthResponse.status, 200);
  assert.deepEqual(await healthResponse.json(), { ok: true });
  assert.equal(versionedHealthResponse.status, 404);
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
