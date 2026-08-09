import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";

import { useLogin } from "@/features/auth/useLogin";

jest.mock("@/features/auth/api", () => ({
  authApi: { login: jest.fn() },
}));

import { authApi } from "@/features/auth/api";

const queryClients: QueryClient[] = [];

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { mutations: { gcTime: 0, retry: false } },
  });
  queryClients.push(client);

  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe("useLogin", () => {
  beforeEach(() => {
    jest.mocked(authApi.login).mockReset();
  });

  afterEach(() => {
    cleanup();
    queryClients.forEach((client) => client.clear());
    queryClients.length = 0;
  });

  it("returns the real auth response from the login API", async () => {
    const response = {
      user: { id: "user-1", email: "mei@example.com" },
      tokens: { accessToken: "access", refreshToken: "refresh" },
    };
    jest.mocked(authApi.login).mockResolvedValueOnce(response);
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.login({ email: "mei@example.com", password: "cook1234" }),
      ).resolves.toEqual(response);
    });

    expect(authApi.login).toHaveBeenCalledWith({
      email: "mei@example.com",
      password: "cook1234",
    });
    expect(result.current.isLoggingIn).toBe(false);
  });

  it("propagates login API failures", async () => {
    const failure = new Error("Request failed");
    jest.mocked(authApi.login).mockRejectedValueOnce(failure);
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.login({ email: "wrong@example.com", password: "coffee123" }),
      ).rejects.toBe(failure);
    });
  });
});
