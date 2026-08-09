import { createAuthApi } from "@/features/auth/api";

interface FetchCall {
  url: string;
  init?: RequestInit;
}

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("createAuthApi", () => {
  it("uses versioned paths for every implemented auth operation", async () => {
    const calls: FetchCall[] = [];
    const api = createAuthApi({
      baseUrl: "http://api.test",
      fetch: async (url, init) => {
        calls.push({ url: String(url), init });

        if (String(url).endsWith("/refresh")) {
          return jsonResponse({ accessToken: "access", refreshToken: "refresh" });
        }
        if (String(url).endsWith("/logout")) {
          return jsonResponse({ ok: true });
        }
        if (String(url).endsWith("/password-reset/verifications")) {
          return jsonResponse({
            resetGrant: "reset-grant",
            expiresAt: "2026-08-09T10:10:00.000Z",
          });
        }
        if (String(url).endsWith("/password-reset/completions")) {
          return jsonResponse({ ok: true });
        }
        if (
          String(url).endsWith("/signup") ||
          String(url).endsWith("/email-verification/requests") ||
          String(url).endsWith("/password-reset/requests")
        ) {
          return jsonResponse({
            ok: true,
            challengeId: "f6822e40-7c3a-40ec-a77f-c3291888dc0c",
            expiresAt: "2026-08-09T10:10:00.000Z",
            resendAvailableAt: "2026-08-09T10:01:00.000Z",
          });
        }
        return jsonResponse({
          user: { id: "user-1", email: "cook@example.com" },
          tokens: { accessToken: "access", refreshToken: "refresh" },
        });
      },
      request: async (url, init) => {
        calls.push({ url: String(url), init });
        return jsonResponse({ ok: true });
      },
    });

    await api.signUp({
      displayName: "Cook",
      email: "cook@example.com",
      password: "password123",
    });
    await api.login({ email: "cook@example.com", password: "password123" });
    await api.refresh({ refreshToken: "refresh" });
    await api.logout({ refreshToken: "refresh" });
    await api.requestEmailVerification({ email: "cook@example.com" });
    await api.confirmEmailVerification({
      challengeId: "f6822e40-7c3a-40ec-a77f-c3291888dc0c",
      code: "123456",
    });
    await api.requestPasswordReset({ email: "cook@example.com" });
    await api.verifyPasswordReset({
      challengeId: "f6822e40-7c3a-40ec-a77f-c3291888dc0c",
      code: "123456",
    });
    await api.completePasswordReset({
      resetGrant: "reset-grant",
      password: "new-password-123",
    });
    await api.deleteAccount();

    expect(calls.map((call) => call.url)).toEqual([
      "http://api.test/v1/auth/signup",
      "http://api.test/v1/auth/login",
      "http://api.test/v1/auth/refresh",
      "http://api.test/v1/auth/logout",
      "http://api.test/v1/auth/email-verification/requests",
      "http://api.test/v1/auth/email-verification/confirmations",
      "http://api.test/v1/auth/password-reset/requests",
      "http://api.test/v1/auth/password-reset/verifications",
      "http://api.test/v1/auth/password-reset/completions",
      "/v1/users/me",
    ]);
    expect(calls.at(-1)?.init?.method).toBe("DELETE");
  });

  it("uses the shared Android default for login requests without a base URL", async () => {
    const calls: FetchCall[] = [];
    const api = createAuthApi({
      fetch: async (url, init) => {
        calls.push({ url: String(url), init });
        return jsonResponse({
          user: { id: "user-1", email: "cook@example.com" },
          tokens: { accessToken: "access", refreshToken: "refresh" },
        });
      },
    });

    await api.login({ email: "cook@example.com", password: "password123" });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe("http://10.0.2.2:8787/v1/auth/login");
  });

  it("posts credentials and returns the auth response", async () => {
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

    expect(response.tokens).toEqual({
      accessToken: "access",
      refreshToken: "refresh",
    });
    expect(calls[0]?.url).toBe("http://api.test/v1/auth/login");
    expect(calls[0]?.init?.method).toBe("POST");
    expect(calls[0]?.init?.body).toBe(
      JSON.stringify({ email: "cook@example.com", password: "password123" }),
    );
  });

  it("preserves signup validation metadata from the shared error envelope", async () => {
    const api = createAuthApi({
      baseUrl: "http://api.test",
      fetch: async () =>
        jsonResponse(
          {
            error: {
              code: "validation_failed",
              message: "Unsafe server prose",
              fieldErrors: { email: ["Enter a valid email address."] },
              requestId: "request-1",
            },
          },
          400,
        ),
    });

    await expect(
      api.signUp({ email: "invalid", password: "password123" }),
    ).rejects.toMatchObject({
      message: "Request failed",
      code: "validation_failed",
      status: 400,
      fieldErrors: { email: ["Enter a valid email address."] },
      requestId: "request-1",
    });
  });

  it("preserves duplicate-signup classification without displaying server prose", async () => {
    const api = createAuthApi({
      baseUrl: "http://api.test",
      fetch: async () =>
        jsonResponse(
          {
            error: {
              code: "email_already_registered",
              message: "Unsafe server prose",
              requestId: "request-2",
            },
          },
          409,
        ),
    });

    await expect(
      api.signUp({ email: "cook@example.com", password: "password123" }),
    ).rejects.toMatchObject({
      message: "Request failed",
      code: "email_already_registered",
      status: 409,
      requestId: "request-2",
    });
  });
});
