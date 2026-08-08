import { createApiClient } from "@/lib/apiClientCore";
import type { AuthTokens } from "@/features/auth/api";

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
        if (request.url.endsWith("/auth/refresh")) {
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

    await apiClient.request("/profiles/me");

    expect(calls).toHaveLength(1);
    expect(calls[0]?.request.url).toBe("http://10.0.2.2:8787/profiles/me");
  });

  it("retries one protected request after refreshing tokens", async () => {
    const calls: FetchCall[] = [];
    const tokenStorage = createMemoryTokenStorage({
      accessToken: "old-access",
      refreshToken: "old-refresh",
    });
    const apiClient = createApiClient({
      baseUrl: "http://api.test",
      tokenStorage,
      fetch: async (url, init) => {
        const request = new Request(url, init);
        calls.push({ request });

        if (request.url.endsWith("/auth/refresh")) {
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

    const response = await apiClient.request("/profiles/me");

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
    expect(calls[2]?.request.headers.get("Authorization")).toBe(
      "Bearer new-access",
    );
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
        new Request(url, init).url.endsWith("/auth/refresh")
          ? jsonResponse({ message: "Invalid refresh token" }, 401)
          : jsonResponse({ message: "Expired" }, 401),
    });

    const response = await apiClient.request("/profiles/me");

    expect(response.status).toBe(401);
    expect(tokenStorage.cleared).toBe(true);
    expect(tokenStorage.savedTokens).toBeNull();
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
        if (request.url.endsWith("/auth/refresh")) {
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
      apiClient.request("/profiles/me"),
      apiClient.request("/profiles/me"),
    ]);

    expect(refreshCalls).toBe(1);
    expect(responses.map((response) => response.status)).toEqual([200, 200]);
  });
});
