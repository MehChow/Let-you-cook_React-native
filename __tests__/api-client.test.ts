import { createApiClient } from "@/lib/apiClientCore";
import type { AuthTokens } from "@/features/auth/api";
import {
  createAuthTokenStorage,
  type AuthTokenStore,
} from "@/features/auth/tokenStorageCore";

interface FetchCall {
  request: Request;
}

// Creates a JSON response for transport tests.
const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

// Creates observable in-memory token storage for transport tests.
const createMemoryTokenStorage = (initialTokens: AuthTokens | null) => {
  let tokens = initialTokens;
  let cleared = false;

  return {
    get cleared() {
      return cleared;
    },
    get savedTokens() {
      return tokens;
    },
    getTokens: async () => tokens,
    saveTokens: async (nextTokens: AuthTokens) => {
      tokens = nextTokens;
    },
    clearTokens: async () => {
      tokens = null;
      cleared = true;
    },
  };
};

// Creates a SecureStore-shaped in-memory boundary for integration coverage.
const createMemorySecureStore = (): AuthTokenStore => {
  const values = new Map<string, string>();

  return {
    getItemAsync: async (key) => values.get(key) ?? null,
    setItemAsync: async (key, value) => {
      values.set(key, value);
    },
    deleteItemAsync: async (key) => {
      values.delete(key);
    },
  };
};

describe("createApiClient", () => {
  it("accepts a Request and preserves its abort signal", async () => {
    const controller = new AbortController();
    controller.abort();
    let capturedSignalWasAborted: boolean | undefined;
    const apiClient = createApiClient({
      baseUrl: "http://api.test",
      tokenStorage: createMemoryTokenStorage(null),
      fetch: async (input, init) => {
        capturedSignalWasAborted = new Request(input, init).signal.aborted;
        return jsonResponse({ ok: true });
      },
    });

    await apiClient.request(new Request("http://api.test/v1/profiles/me", {
      signal: controller.signal,
    }));

    expect(capturedSignalWasAborted).toBe(true);
  });

  it("preserves caller cancellation on a post-refresh replay", async () => {
    const controller = new AbortController();
    const protectedAttemptAbortStates: boolean[] = [];
    const apiClient = createApiClient({
      baseUrl: "http://api.test",
      tokenStorage: createMemoryTokenStorage({
        accessToken: "old-access",
        refreshToken: "old-refresh",
      }),
      fetch: async (input, init) => {
        const request = new Request(input, init);
        if (request.url.endsWith("/v1/auth/refresh")) {
          controller.abort();
          return jsonResponse({
            accessToken: "new-access",
            refreshToken: "new-refresh",
          });
        }

        protectedAttemptAbortStates.push(request.signal.aborted);
        return protectedAttemptAbortStates.length === 1
          ? jsonResponse({ message: "Expired" }, 401)
          : jsonResponse({ ok: true });
      },
    });

    await apiClient.request(new Request("http://api.test/v1/profiles/me", {
      signal: controller.signal,
    }));

    expect(protectedAttemptAbortStates).toEqual([false, true]);
  });

  it("uses the shared Android default for requests without a base URL", async () => {
    const calls: FetchCall[] = [];
    const apiClient = createApiClient({
      tokenStorage: createMemoryTokenStorage(null),
      fetch: async (url, init) => {
        calls.push({ request: new Request(url, init) });
        return jsonResponse({ ok: true });
      },
    });

    await apiClient.request("/v1/profiles/me");

    expect(calls).toHaveLength(1);
    expect(calls[0]?.request.url).toBe("http://10.0.2.2:8787/v1/profiles/me");
  });

  it("retries one protected request after refreshing tokens", async () => {
    const calls: FetchCall[] = [];
    const onTokensRefreshed = jest.fn();
    const tokenStorage = createMemoryTokenStorage({
      accessToken: "old-access",
      refreshToken: "old-refresh",
    });
    const apiClient = createApiClient({
      baseUrl: "http://api.test",
      tokenStorage,
      onTokensRefreshed,
      fetch: async (url, init) => {
        const request = new Request(url, init);
        calls.push({ request });

        if (request.url.endsWith("/v1/auth/refresh")) {
          return jsonResponse({
            accessToken: "new-access",
            refreshToken: "new-refresh",
          });
        }

        return calls.length === 1
          ? jsonResponse({ message: "Expired" }, 401)
          : jsonResponse({ ok: true });
      },
    });

    const response = await apiClient.request("/v1/profiles/me");

    expect(response.status).toBe(200);
    expect(calls).toHaveLength(3);
    expect(calls[0]?.request.headers.get("Authorization")).toBe(
      "Bearer old-access",
    );
    expect(await calls[1]?.request.clone().json()).toEqual({
      refreshToken: "old-refresh",
    });
    expect(tokenStorage.savedTokens).toEqual({
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });
    expect(onTokensRefreshed).toHaveBeenCalledWith({
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });
    expect(calls[2]?.request.headers.get("Authorization")).toBe(
      "Bearer new-access",
    );
  });

  it("persists rotated tokens in the session restored after relaunch", async () => {
    const tokenStorage = createAuthTokenStorage(createMemorySecureStore());
    await tokenStorage.saveSession({
      user: { id: "user-1", email: "cook@example.com" },
      tokens: { accessToken: "old-access", refreshToken: "old-refresh" },
      accessTokenExpiresAt: 0,
    });
    let protectedCalls = 0;
    const apiClient = createApiClient({
      baseUrl: "http://api.test",
      tokenStorage,
      fetch: async (input, init) => {
        const request = new Request(input, init);
        if (request.url.endsWith("/v1/auth/refresh")) {
          return jsonResponse({
            accessToken: "new-access",
            refreshToken: "new-refresh",
          });
        }

        protectedCalls += 1;
        return protectedCalls === 1
          ? jsonResponse({ message: "Expired" }, 401)
          : jsonResponse({ ok: true });
      },
    });

    const response = await apiClient.request("/v1/profiles/me");

    expect(response.status).toBe(200);
    expect((await tokenStorage.getSession())?.tokens).toEqual({
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });
  });

  it("replays a protected request method, headers, and body after refresh", async () => {
    const protectedAttempts: Request[] = [];
    const apiClient = createApiClient({
      baseUrl: "http://api.test",
      tokenStorage: createMemoryTokenStorage({
        accessToken: "old-access",
        refreshToken: "old-refresh",
      }),
      fetch: async (input, init) => {
        const request = new Request(input, init);
        if (request.url.endsWith("/v1/auth/refresh")) {
          return jsonResponse({
            accessToken: "new-access",
            refreshToken: "new-refresh",
          });
        }

        protectedAttempts.push(request);
        return protectedAttempts.length === 1
          ? jsonResponse({ message: "Expired" }, 401)
          : jsonResponse({ ok: true });
      },
    });

    await apiClient.request("/v1/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Soup" }),
    });

    expect(protectedAttempts).toHaveLength(2);
    for (const request of protectedAttempts) {
      expect(request.method).toBe("POST");
      expect(request.headers.get("Content-Type")).toBe("application/json");
      expect(await request.clone().json()).toEqual({ title: "Soup" });
    }
  });

  it("clears stored tokens when refresh is rejected", async () => {
    const tokenStorage = createMemoryTokenStorage({
      accessToken: "old-access",
      refreshToken: "old-refresh",
    });
    const apiClient = createApiClient({
      baseUrl: "http://api.test",
      tokenStorage,
      fetch: async (url, init) =>
        new Request(url, init).url.endsWith("/v1/auth/refresh")
          ? jsonResponse({ message: "Invalid refresh token" }, 401)
          : jsonResponse({ message: "Expired" }, 401),
    });

    const response = await apiClient.request("/v1/profiles/me");

    expect(response.status).toBe(401);
    expect(tokenStorage.cleared).toBe(true);
    expect(tokenStorage.savedTokens).toBeNull();
  });

  it("rejects malformed successful refresh responses before persistence", async () => {
    const tokenStorage = createMemoryTokenStorage({
      accessToken: "old-access",
      refreshToken: "old-refresh",
    });
    const apiClient = createApiClient({
      baseUrl: "http://api.test",
      tokenStorage,
      fetch: async (input, init) =>
        new Request(input, init).url.endsWith("/v1/auth/refresh")
          ? jsonResponse({ accessToken: "", refreshToken: "new-refresh" })
          : jsonResponse({ message: "Expired" }, 401),
    });

    await expect(apiClient.request("/v1/profiles/me")).rejects.toThrow();
    expect(tokenStorage.savedTokens).toEqual({
      accessToken: "old-access",
      refreshToken: "old-refresh",
    });
  });

  it("shares one refresh across concurrent expired requests", async () => {
    let refreshCalls = 0;
    const tokenStorage = createMemoryTokenStorage({
      accessToken: "old-access",
      refreshToken: "old-refresh",
    });
    const apiClient = createApiClient({
      baseUrl: "http://api.test",
      tokenStorage,
      fetch: async (url, init) => {
        const request = new Request(url, init);
        if (request.url.endsWith("/v1/auth/refresh")) {
          refreshCalls += 1;
          return jsonResponse({
            accessToken: "new-access",
            refreshToken: "new-refresh",
          });
        }

        return request.headers.get("Authorization") === "Bearer new-access"
          ? jsonResponse({ ok: true })
          : jsonResponse({ message: "Expired" }, 401);
      },
    });

    const responses = await Promise.all([
      apiClient.request("/v1/profiles/me"),
      apiClient.request("/v1/profiles/me"),
    ]);

    expect(refreshCalls).toBe(1);
    expect(responses.map((response) => response.status)).toEqual([200, 200]);
  });

  it("reports one invalid session across concurrent rejected refreshes", async () => {
    const onSessionExpired = jest.fn();
    const tokenStorage = createMemoryTokenStorage({
      accessToken: "old-access",
      refreshToken: "invalid-refresh",
    });
    const apiClient = createApiClient({
      baseUrl: "http://api.test",
      tokenStorage,
      onSessionExpired,
      fetch: async (url, init) =>
        new Request(url, init).url.endsWith("/v1/auth/refresh")
          ? jsonResponse({ message: "Invalid refresh token" }, 401)
          : jsonResponse({ message: "Expired" }, 401),
    });

    const responses = await Promise.all([
      apiClient.request("/v1/profiles/me"),
      apiClient.request("/v1/profiles/me"),
    ]);

    expect(responses.map((response) => response.status)).toEqual([401, 401]);
    expect(tokenStorage.cleared).toBe(true);
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });
});
