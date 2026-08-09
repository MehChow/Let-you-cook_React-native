import {
  createSessionInvalidation,
  createAuthSession,
  isAccessTokenExpired,
  restoreAuthSession,
} from "@/features/auth/session";

const serverAccessToken = [
  "header",
  Buffer.from(JSON.stringify({ exp: 1_700_000_000 })).toString("base64url"),
  "signature",
].join(".");

describe("auth session helpers", () => {
  it("creates a stored session from a server auth response", () => {
    expect(
      createAuthSession(
        {
          user: { id: "user-1", email: "mei@example.com" },
          tokens: { accessToken: serverAccessToken, refreshToken: "refresh" },
        },
        1_000,
      ),
    ).toEqual({
      user: { id: "user-1", email: "mei@example.com" },
      tokens: { accessToken: serverAccessToken, refreshToken: "refresh" },
      accessTokenExpiresAt: 1_700_000_000_000,
    });
  });

  it("falls back to a 15-minute expiry for opaque server access tokens", () => {
    const session = createAuthSession(
      {
        user: { id: "user-1", email: "cook@example.com" },
        tokens: { accessToken: "opaque-access", refreshToken: "refresh" },
      },
      1_000,
    );

    expect(session.user.email).toBe("cook@example.com");
    expect(session.accessTokenExpiresAt).toBe(901_000);
    expect(isAccessTokenExpired(session, 900_999)).toBe(false);
    expect(isAccessTokenExpired(session, 901_000)).toBe(true);
  });

  it("refreshes one expired stored session and persists the rotated tokens", async () => {
    const expiredSession = {
      user: { id: "user-1", email: "cook@example.com" },
      tokens: { accessToken: "expired-access", refreshToken: "old-refresh" },
      accessTokenExpiresAt: 999,
    };
    const refresh = jest.fn().mockResolvedValue({
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });
    const saveSession = jest.fn().mockResolvedValue(undefined);

    const restored = await restoreAuthSession({
      getSession: async () => expiredSession,
      refresh,
      saveSession,
      clearTokens: jest.fn(),
      now: () => 1_000,
    });

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledWith({ refreshToken: "old-refresh" });
    expect(restored).toEqual({
      user: expiredSession.user,
      tokens: { accessToken: "new-access", refreshToken: "new-refresh" },
      accessTokenExpiresAt: 901_000,
    });
    expect(saveSession).toHaveBeenCalledWith(restored);
  });

  it("clears an expired stored session when its hydration refresh fails", async () => {
    const clearTokens = jest.fn().mockResolvedValue(undefined);

    const restored = await restoreAuthSession({
      getSession: async () => ({
        user: { id: "user-1", email: "cook@example.com" },
        tokens: { accessToken: "expired-access", refreshToken: "invalid-refresh" },
        accessTokenExpiresAt: 999,
      }),
      refresh: async () => {
        throw new Error("refresh rejected");
      },
      saveSession: jest.fn(),
      clearTokens,
      now: () => 1_000,
    });

    expect(restored).toBeNull();
    expect(clearTokens).toHaveBeenCalledTimes(1);
  });

  it("clears partial token state when no stored session can be restored", async () => {
    const clearTokens = jest.fn().mockResolvedValue(undefined);

    const restored = await restoreAuthSession({
      getSession: async () => null,
      refresh: jest.fn(),
      saveSession: jest.fn(),
      clearTokens,
    });

    expect(restored).toBeNull();
    expect(clearTokens).toHaveBeenCalledTimes(1);
  });

  it("notifies session expiry once until a new session resets it", () => {
    const invalidation = createSessionInvalidation();
    const listener = jest.fn();
    invalidation.subscribe(listener);

    invalidation.notify();
    invalidation.notify();

    expect(listener).toHaveBeenCalledTimes(1);

    invalidation.reset();
    invalidation.notify();

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("delivers a latched invalidation to a late session subscriber", () => {
    const invalidation = createSessionInvalidation();
    const listener = jest.fn();

    invalidation.notify();
    invalidation.subscribe(listener);

    expect(listener).toHaveBeenCalledTimes(1);
  });
});
