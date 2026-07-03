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
  it("saves, reads, and clears both tokens", async () => {
    const storage = createAuthTokenStorage(createMemoryStore());

    expect(await storage.getTokens()).toBeNull();

    await storage.saveTokens({ accessToken: "access", refreshToken: "refresh" });

    expect(await storage.getTokens()).toEqual({
      accessToken: "access",
      refreshToken: "refresh",
    });

    await storage.clearTokens();

    expect(await storage.getTokens()).toBeNull();
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
});
