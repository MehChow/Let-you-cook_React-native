import type { MockLoginInput, StoredAuthSession } from "./authTypes";

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

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
