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
        return jsonResponse({
          user: { id: "user-1", email: "cook@example.com" },
          tokens: { accessToken: "access", refreshToken: "refresh" },
        });
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

    expect(calls.map((call) => call.url)).toEqual([
      "http://api.test/v1/auth/signup",
      "http://api.test/v1/auth/login",
      "http://api.test/v1/auth/refresh",
      "http://api.test/v1/auth/logout",
    ]);
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

  it("accepts a password reset email through the placeholder API", async () => {
    const api = createAuthApi();

    await expect(api.sendPasswordResetCode({ email: "cook@example.com" })).resolves.toEqual({
      ok: true,
    });
  });

  it("rejects a blank password reset email", async () => {
    const api = createAuthApi();

    await expect(api.sendPasswordResetCode({ email: "  " })).rejects.toThrow(
      "Enter your email address.",
    );
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
