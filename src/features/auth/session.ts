import type { AuthResponse, AuthTokens, RefreshTokenInput } from "./api";
import type { StoredAuthSession } from "./authTypes";

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

interface AuthSessionRestoration {
  getSession(): Promise<StoredAuthSession | null>;
  refresh(input: RefreshTokenInput): Promise<AuthTokens>;
  saveSession(session: StoredAuthSession): Promise<void>;
  clearTokens(): Promise<void>;
  now?(): number;
}

// Reads the expiry timestamp from a JWT-shaped access token.
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

// Maps a server authentication response into persisted mobile session state.
export const createAuthSession = (
  response: AuthResponse,
  now = Date.now(),
): StoredAuthSession => ({
  user: response.user,
  tokens: response.tokens,
  accessTokenExpiresAt:
    readAccessTokenExpiry(response.tokens.accessToken) ?? now + ACCESS_TOKEN_TTL_MS,
});

// Reports whether session access has reached its expiry boundary.
export const isAccessTokenExpired = (
  session: Pick<StoredAuthSession, "accessTokenExpiresAt"> | null,
  now = Date.now(),
) => !session || session.accessTokenExpiresAt <= now;

// Restores valid credentials or rotates one expired access token.
export const restoreAuthSession = async ({
  getSession,
  refresh,
  saveSession,
  clearTokens,
  now = Date.now,
}: AuthSessionRestoration) => {
  const storedSession = await getSession();

  if (!storedSession) {
    await clearTokens();
    return null;
  }

  if (!isAccessTokenExpired(storedSession, now())) {
    return storedSession;
  }

  try {
    const tokens = await refresh({
      refreshToken: storedSession.tokens.refreshToken,
    });
    const restoredSession = createAuthSession(
      { user: storedSession.user, tokens },
      now(),
    );
    await saveSession(restoredSession);

    return restoredSession;
  } catch {
    await clearTokens();
    return null;
  }
};
