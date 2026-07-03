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
    expect(calls[0]?.url).toBe("http://api.test/auth/login");
    expect(calls[0]?.init?.method).toBe("POST");
    expect(calls[0]?.init?.body).toBe(
      JSON.stringify({ email: "cook@example.com", password: "password123" }),
    );
  });

  it("surfaces auth errors with status and message", async () => {
    const api = createAuthApi({
      baseUrl: "http://api.test",
      fetch: async () => jsonResponse({ message: "Invalid email or password" }, 401),
    });

    await expect(
      api.login({ email: "cook@example.com", password: "wrong-password" }),
    ).rejects.toMatchObject({
      message: "Invalid email or password",
      status: 401,
    });
  });
});
