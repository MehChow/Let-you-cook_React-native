import assert from "node:assert/strict";
import { test } from "node:test";

import { app } from "./app";

test("GET /health returns ok", async () => {
  const response = await app.request("/health");

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
});
