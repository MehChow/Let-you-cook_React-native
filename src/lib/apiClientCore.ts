import type { AuthTokens } from "@/features/auth/api";

interface ApiTokenStorage {
  getTokens(): Promise<AuthTokens | null>;
  saveTokens(tokens: AuthTokens): Promise<void>;
  clearTokens(): Promise<void>;
}

interface ApiClientOptions {
  baseUrl?: string;
  fetch?: typeof fetch;
  tokenStorage: ApiTokenStorage;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
const AUTH_PATHS = new Set(["/auth/signup", "/auth/login", "/auth/refresh", "/auth/logout"]);

const getPathname = (baseUrl: string, path: string) => new URL(path, `${baseUrl}/`).pathname;

const withBearerToken = (init: RequestInit | undefined, accessToken: string): RequestInit => {
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);

  return { ...init, headers };
};

export const createApiClient = (options: ApiClientOptions) => {
  const baseUrl = (options.baseUrl ?? API_BASE_URL).replace(/\/$/, "");
  const fetchImpl = options.fetch ?? fetch;
  let refreshPromise: Promise<AuthTokens | null> | null = null;

  const refreshTokens = async (refreshToken: string) => {
    refreshPromise ??= fetchImpl(`${baseUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        if (response.status === 401 || response.status === 403) {
          await options.tokenStorage.clearTokens();
          return null;
        }

        if (!response.ok) {
          return null;
        }

        const tokens = (await response.json()) as AuthTokens;
        await options.tokenStorage.saveTokens(tokens);
        return tokens;
      })
      .finally(() => {
        refreshPromise = null;
      });

    return refreshPromise;
  };

  const request = async (path: string, init?: RequestInit): Promise<Response> => {
    const url = path.startsWith("http://") || path.startsWith("https://")
      ? path
      : `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
    const isAuthPath = AUTH_PATHS.has(getPathname(baseUrl, path));
    const tokens = await options.tokenStorage.getTokens();
    const response = await fetchImpl(
      url,
      tokens?.accessToken && !isAuthPath ? withBearerToken(init, tokens.accessToken) : init,
    );

    if (response.status !== 401 || isAuthPath || !tokens?.refreshToken) {
      return response;
    }

    const refreshedTokens = await refreshTokens(tokens.refreshToken);
    return refreshedTokens ? fetchImpl(url, withBearerToken(init, refreshedTokens.accessToken)) : response;
  };

  return { request };
};
