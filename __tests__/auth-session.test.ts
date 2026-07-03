import {
  createMockAuthSession,
  isAccessTokenExpired,
} from "@/features/auth/session";

describe("auth session helpers", () => {
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
