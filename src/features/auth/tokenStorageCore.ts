import type { AuthTokens } from "./api";

const ACCESS_TOKEN_KEY = "letyoucook.auth.access-token";
const REFRESH_TOKEN_KEY = "letyoucook.auth.refresh-token";

export interface AuthTokenStore {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}

export const createAuthTokenStorage = (store: AuthTokenStore) => ({
  getTokens: async (): Promise<AuthTokens | null> => {
    const [accessToken, refreshToken] = await Promise.all([
      store.getItemAsync(ACCESS_TOKEN_KEY),
      store.getItemAsync(REFRESH_TOKEN_KEY),
    ]);

    return accessToken && refreshToken ? { accessToken, refreshToken } : null;
  },
  saveTokens: (tokens: AuthTokens) =>
    Promise.all([
      store.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken),
      store.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
    ]).then(() => undefined),
  clearTokens: () =>
    Promise.all([
      store.deleteItemAsync(ACCESS_TOKEN_KEY),
      store.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]).then(() => undefined),
});
