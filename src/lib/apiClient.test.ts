import assert from "node:assert/strict";
import test from "node:test";

import { createApiClient } from "./apiClientCore";

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

test("retries a protected request once after refreshing tokens", async () => {
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
        return jsonResponse({ accessToken: "new-access", refreshToken: "new-refresh" });
      }

      return calls.length === 1
        ? jsonResponse({ message: "Expired" }, 401)
        : jsonResponse({ ok: true });
    },
  });

  const response = await apiClient.request("/profiles/me");

  assert.equal(response.status, 200);
  assert.equal(calls.length, 3);
  assert.equal(new Headers(calls[0]?.init?.headers).get("Authorization"), "Bearer old-access");
  assert.deepEqual(JSON.parse(String(calls[1]?.init?.body)), { refreshToken: "old-refresh" });
  assert.deepEqual(tokenStorage.savedTokens, {
    accessToken: "new-access",
    refreshToken: "new-refresh",
  });
  assert.equal(new Headers(calls[2]?.init?.headers).get("Authorization"), "Bearer new-access");
});

test("clears stored tokens when refresh is rejected", async () => {
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

  assert.equal(response.status, 401);
  assert.equal(tokenStorage.cleared, true);
  assert.equal(tokenStorage.savedTokens, null);
});

test("shares one refresh across concurrent expired requests", async () => {
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
        return jsonResponse({ accessToken: "new-access", refreshToken: "new-refresh" });
      }

      return new Headers(init?.headers).get("Authorization") === "Bearer new-access"
        ? jsonResponse({ ok: true })
        : jsonResponse({ message: "Expired" }, 401);
    },
  });

  const responses = await Promise.all([apiClient.request("/profiles/me"), apiClient.request("/profiles/me")]);

  assert.equal(refreshCalls, 1);
  assert.deepEqual(
    responses.map((response) => response.status),
    [200, 200],
  );
});
