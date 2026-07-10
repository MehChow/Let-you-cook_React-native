import {
  createAuthSession,
  createMockAuthSession,
  isAccessTokenExpired,
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

  it("expires the mock access token after 15 minutes", () => {
    const session = createMockAuthSession({
      email: "cook@example.com",
      now: 1_000,
    });

    expect(session.user.email).toBe("cook@example.com");
    expect(session.accessTokenExpiresAt).toBe(901_000);
    expect(isAccessTokenExpired(session, 900_999)).toBe(false);
    expect(isAccessTokenExpired(session, 901_000)).toBe(true);
  });
});
