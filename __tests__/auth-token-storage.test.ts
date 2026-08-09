import {
  createAuthTokenStorage,
  type AuthTokenStore,
} from "@/features/auth/tokenStorageCore";

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

describe("auth token storage", () => {
  it("rejects token-only state without an established session", async () => {
    const storage = createAuthTokenStorage(createMemoryStore());

    expect(await storage.getTokens()).toBeNull();

    await expect(
      storage.saveTokens({ accessToken: "access", refreshToken: "refresh" }),
    ).rejects.toThrow("Cannot rotate tokens without a valid stored session.");
  });

  it("saves, reads, and clears the stored session", async () => {
    const storage = createAuthTokenStorage(createMemoryStore());

    await storage.saveSession({
      user: { id: "mock-user", email: "cook@example.com" },
      tokens: { accessToken: "access", refreshToken: "refresh" },
      accessTokenExpiresAt: 123,
    });

    expect(await storage.getSession()).toEqual({
      user: { id: "mock-user", email: "cook@example.com" },
      tokens: { accessToken: "access", refreshToken: "refresh" },
      accessTokenExpiresAt: 123,
    });

    await storage.clearTokens();

    expect(await storage.getSession()).toBeNull();
  });

  it("uses the validated session as the authoritative token source", async () => {
    const store = createMemoryStore();
    const storage = createAuthTokenStorage(store);
    await storage.saveSession({
      user: { id: "user-1", email: "cook@example.com" },
      tokens: { accessToken: "session-access", refreshToken: "session-refresh" },
      accessTokenExpiresAt: 123,
    });
    await store.setItemAsync("letyoucook.auth.access-token", "stale-access");
    await store.setItemAsync("letyoucook.auth.refresh-token", "stale-refresh");

    await expect(storage.getTokens()).resolves.toEqual({
      accessToken: "session-access",
      refreshToken: "session-refresh",
    });
  });

  it.each(["not-json", JSON.stringify({})])(
    "rejects malformed persisted session data: %s",
    async (storedValue) => {
      const store = createMemoryStore();
      const storage = createAuthTokenStorage(store);
      await store.setItemAsync("letyoucook.auth.session", storedValue);

      await expect(storage.getSession()).resolves.toBeNull();
    },
  );
});
