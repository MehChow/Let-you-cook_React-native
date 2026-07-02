import assert from "node:assert/strict";
import test from "node:test";

import { createAuthTokenStorage, type AuthTokenStore } from "./tokenStorageCore";

const createMemoryStore = (): AuthTokenStore => {
  const values = new Map<string, string>();

  return {
    getItemAsync: async (key) => values.get(key) ?? null,
    setItemAsync: async (key, value) => {
      values.set(key, value);
    },
    deleteItemAsync: async (key) => {
      values.delete(key);
    },
  };
};

test("auth token storage saves, reads, and clears both tokens", async () => {
  const storage = createAuthTokenStorage(createMemoryStore());

  assert.equal(await storage.getTokens(), null);

  await storage.saveTokens({ accessToken: "access", refreshToken: "refresh" });

  assert.deepEqual(await storage.getTokens(), {
    accessToken: "access",
    refreshToken: "refresh",
  });

  await storage.clearTokens();

  assert.equal(await storage.getTokens(), null);
});
