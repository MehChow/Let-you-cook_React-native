import assert from "node:assert/strict";
import { after, test } from "node:test";

import { app } from "../app";
import { pool } from "../db/client";

after(async () => {
  await pool.end();
});

test("signup rejects passwords longer than 20 characters", async () => {
  const response = await app.request("/auth/signup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: "long-password@example.com",
      password: "a".repeat(21),
      displayName: "Long Password",
    }),
  });

  assert.equal(response.status, 400);
});
