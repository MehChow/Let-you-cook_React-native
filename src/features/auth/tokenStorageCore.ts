import type { AuthTokens } from "./api";
import type { StoredAuthSession } from "./authTypes";
import { createAuthSession } from "./session";
import { z } from "zod";

const ACCESS_TOKEN_KEY = "letyoucook.auth.access-token";
const REFRESH_TOKEN_KEY = "letyoucook.auth.refresh-token";
const SESSION_KEY = "letyoucook.auth.session";

const storedAuthSessionSchema = z.strictObject({
  user: z.strictObject({
    id: z.string().min(1),
    email: z.email(),
  }),
  tokens: z.strictObject({
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1),
  }),
  accessTokenExpiresAt: z.number().finite(),
});

export interface AuthTokenStore {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}

// Parses persisted session JSON without trusting obsolete or corrupt state.
const parseStoredSession = (value: string | null): StoredAuthSession | null => {
  if (!value) {
    return null;
  }

  try {
    const result = storedAuthSessionSchema.safeParse(JSON.parse(value));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
};

export const createAuthTokenStorage = (store: AuthTokenStore) => ({
  getTokens: async (): Promise<AuthTokens | null> => {
    const session = parseStoredSession(await store.getItemAsync(SESSION_KEY));
    return session?.tokens ?? null;
  },
  saveTokens: async (tokens: AuthTokens) => {
    const storedValue = await store.getItemAsync(SESSION_KEY);
    const storedSession = parseStoredSession(storedValue);
    if (!storedSession) {
      throw new Error("Cannot rotate tokens without a valid stored session.");
    }
    const rotatedSession = createAuthSession({ user: storedSession.user, tokens });

    await store.setItemAsync(SESSION_KEY, JSON.stringify(rotatedSession));
    await Promise.all([
      store.deleteItemAsync(ACCESS_TOKEN_KEY),
      store.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  },
  getSession: async (): Promise<StoredAuthSession | null> => {
    const value = await store.getItemAsync(SESSION_KEY);
    return parseStoredSession(value);
  },
  saveSession: async (session: StoredAuthSession) => {
    const validatedSession = storedAuthSessionSchema.parse(session);
    await store.setItemAsync(SESSION_KEY, JSON.stringify(validatedSession));
    await Promise.all([
      store.deleteItemAsync(ACCESS_TOKEN_KEY),
      store.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  },
  clearTokens: () =>
    Promise.all([
      store.deleteItemAsync(ACCESS_TOKEN_KEY),
      store.deleteItemAsync(REFRESH_TOKEN_KEY),
      store.deleteItemAsync(SESSION_KEY),
    ]).then(() => undefined),
});
