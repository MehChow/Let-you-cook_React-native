import type { AuthTokens } from "@/features/auth/api";
import { appEnv } from "@/config/env";

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

const AUTH_PATHS = new Set([
  "/v1/auth/signup",
  "/v1/auth/login",
  "/v1/auth/refresh",
  "/v1/auth/logout",
]);

// Builds an absolute pathname for authentication route classification.
const getPathname = (baseUrl: string, input: RequestInfo | URL) => {
  const value = input instanceof Request ? input.url : input.toString();
  return new URL(value, `${baseUrl}/`).pathname;
};

// Normalizes fetch inputs into a replayable absolute request.
const createRequest = (baseUrl: string, input: RequestInfo | URL, init?: RequestInit) => {
  const value = input instanceof Request ? input.url : input.toString();
  const url = new URL(value, `${baseUrl}/`).toString();

  return input instanceof Request
    ? new Request(new Request(url, input), init)
    : new Request(url, init);
};

// Adds the current access token to outgoing request headers.
const withBearerToken = (request: Request, accessToken: string) => {
  const headers = new Headers(request.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);

  return new Request(request.clone(), { headers });
};

// Creates an authenticated client with single-flight token refresh.
export const createApiClient = (options: ApiClientOptions) => {
  const baseUrl = (options.baseUrl ?? appEnv.apiBaseUrl).replace(/\/$/, "");
  const fetchImpl = options.fetch ?? fetch;
  let refreshPromise: Promise<AuthTokens | null> | null = null;

  // Rotates expired credentials while deduplicating concurrent refresh attempts.
  const refreshTokens = async (refreshToken: string) => {
    refreshPromise ??= fetchImpl(`${baseUrl}/v1/auth/refresh`, {
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

  // Sends a request and retries once after successful refresh.
  const request = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const baseRequest = createRequest(baseUrl, input, init);
    const isAuthPath = AUTH_PATHS.has(getPathname(baseUrl, baseRequest));
    const tokens = await options.tokenStorage.getTokens();
    const firstRequest = tokens?.accessToken && !isAuthPath
      ? withBearerToken(baseRequest, tokens.accessToken)
      : baseRequest.clone();
    const response = await fetchImpl(firstRequest);

    if (response.status !== 401 || isAuthPath || !tokens?.refreshToken) {
      return response;
    }

    const refreshedTokens = await refreshTokens(tokens.refreshToken);
    return refreshedTokens
      ? fetchImpl(withBearerToken(baseRequest, refreshedTokens.accessToken))
      : response;
  };

  return { request };
};
