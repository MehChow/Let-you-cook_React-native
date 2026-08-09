import type { AuthTokens, AuthUser } from "./api";

export interface StoredAuthSession {
  user: AuthUser;
  tokens: AuthTokens;
  accessTokenExpiresAt: number;
}
