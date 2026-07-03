import type { AuthTokens, AuthUser } from "./api";

export interface StoredAuthSession {
  user: AuthUser;
  tokens: AuthTokens;
  accessTokenExpiresAt: number;
}

export interface MockLoginInput {
  email: string;
  now?: number;
}
