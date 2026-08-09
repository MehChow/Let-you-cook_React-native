import assert from "node:assert/strict";
import { after, test } from "node:test";

import { app } from "../app";
import { pool } from "../db/client";
import type { ApiErrorEnvelope } from "../http/errors";
import { REQUEST_ID_HEADER } from "../http/requestId";

after(async () => {
  await pool.end();
});

test("signup rejects passwords longer than 20 characters", async () => {
  const response = await app.request("/v1/auth/signup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: "long-password@example.com",
      password: "a".repeat(21),
      displayName: "Long Password",
    }),
  });

  assert.equal(response.status, 400);
  const requestId = response.headers.get(REQUEST_ID_HEADER);
  const body = (await response.json()) as ApiErrorEnvelope;

  assert.ok(requestId);
  assert.deepEqual(body, {
    error: {
      code: "validation_failed",
      message: "Some fields need attention.",
      fieldErrors: {
        password: ["Too big: expected string to have <=20 characters"],
      },
      requestId,
    },
  });
});
