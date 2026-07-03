import { createApiClient } from "@/lib/apiClientCore";
import type { AuthTokens } from "@/features/auth/api";

interface FetchCall {
  url: string;
  init?: RequestInit;
}

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

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
        calls.push({ url: String(url), init });

        if (String(url).endsWith("/auth/refresh")) {
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
    expect(new Headers(calls[0]?.init?.headers).get("Authorization")).toBe(
      "Bearer old-access",
    );
    expect(JSON.parse(String(calls[1]?.init?.body))).toEqual({
      refreshToken: "old-refresh",
    });
    expect(tokenStorage.savedTokens).toEqual({
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });
    expect(new Headers(calls[2]?.init?.headers).get("Authorization")).toBe(
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
      fetch: async (url) =>
        String(url).endsWith("/auth/refresh")
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
        if (String(url).endsWith("/auth/refresh")) {
          refreshCalls += 1;
          return jsonResponse({
            accessToken: "new-access",
            refreshToken: "new-refresh",
          });
        }

        return new Headers(init?.headers).get("Authorization") === "Bearer new-access"
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
