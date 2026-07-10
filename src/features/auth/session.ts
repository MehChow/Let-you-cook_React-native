import type { AuthResponse } from "./api";
import type { MockLoginInput, StoredAuthSession } from "./authTypes";

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

const readAccessTokenExpiry = (accessToken: string) => {
  const payload = accessToken.split(".")[1];

  if (!payload) {
    return null;
  }

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(
      Math.ceil(payload.length / 4) * 4,
      "=",
    );
    const claims = JSON.parse(atob(normalizedPayload)) as { exp?: unknown };

    return typeof claims.exp === "number" && Number.isFinite(claims.exp)
      ? claims.exp * 1000
      : null;
  } catch {
    return null;
  }
};

export const createAuthSession = (
  response: AuthResponse,
  now = Date.now(),
): StoredAuthSession => ({
  user: response.user,
  tokens: response.tokens,
  accessTokenExpiresAt:
    readAccessTokenExpiry(response.tokens.accessToken) ?? now + ACCESS_TOKEN_TTL_MS,
});

export const createMockAuthSession = ({
  email,
  now = Date.now(),
}: MockLoginInput): StoredAuthSession => ({
  user: {
    id: "mock-user",
    email: email.trim() || "cook@example.com",
  },
  tokens: {
    accessToken: `mock-access-${now}`,
    refreshToken: `mock-refresh-${now}`,
  },
  accessTokenExpiresAt: now + ACCESS_TOKEN_TTL_MS,
});

export const isAccessTokenExpired = (
  session: Pick<StoredAuthSession, "accessTokenExpiresAt"> | null,
  now = Date.now(),
) => !session || session.accessTokenExpiresAt <= now;
