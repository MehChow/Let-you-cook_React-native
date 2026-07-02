import assert from "node:assert/strict";
import { test } from "node:test";

import { createRefreshToken, hashRefreshToken } from "./tokens";

test("refresh token hashing is stable and does not store the raw token", () => {
  const token = createRefreshToken();
  const hash = hashRefreshToken(token);

  assert.equal(hashRefreshToken(token), hash);
  assert.notEqual(hash, token);
});
