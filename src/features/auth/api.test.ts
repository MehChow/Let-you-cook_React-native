import assert from "node:assert/strict";
import test from "node:test";

import { createAuthApi } from "./api";

interface FetchCall {
  url: string;
  init?: RequestInit;
}

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

test("login posts credentials and returns the server auth response", async () => {
  const calls: FetchCall[] = [];
  const api = createAuthApi({
    baseUrl: "http://api.test",
    fetch: async (url, init) => {
      calls.push({ url: String(url), init });
      return jsonResponse({
        user: { id: "user-1", email: "cook@example.com" },
        tokens: { accessToken: "access", refreshToken: "refresh" },
      });
    },
  });

  const response = await api.login({
    email: "cook@example.com",
    password: "password123",
  });

  assert.deepEqual(response.tokens, {
    accessToken: "access",
    refreshToken: "refresh",
  });
  assert.equal(calls[0]?.url, "http://api.test/auth/login");
  assert.equal(calls[0]?.init?.method, "POST");
  assert.equal(
    calls[0]?.init?.body,
    JSON.stringify({ email: "cook@example.com", password: "password123" }),
  );
});

test("auth errors include the response status and message", async () => {
  const api = createAuthApi({
    baseUrl: "http://api.test",
    fetch: async () => jsonResponse({ message: "Invalid email or password" }, 401),
  });

  await assert.rejects(
    api.login({ email: "cook@example.com", password: "wrong-password" }),
    { message: "Invalid email or password", status: 401 },
  );
});
