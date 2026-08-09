import {
  createAuthSession,
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
});
