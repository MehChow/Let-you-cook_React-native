import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";

import { useCreateAccount } from "@/features/auth/useCreateAccount";

jest.mock("@/features/auth/api", () => ({
  authApi: { signUp: jest.fn() },
}));

import { authApi } from "@/features/auth/api";

const input = {
  displayName: "Mei Lin",
  email: "mei@example.com",
  password: "cook1234",
};

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

describe("useCreateAccount", () => {
  afterEach(() => {
    cleanup();
    queryClients.forEach((client) => client.clear());
    queryClients.length = 0;
  });

  it("creates an account through the auth API", async () => {
    const response = {
      ok: true as const,
      challengeId: "f6822e40-7c3a-40ec-a77f-c3291888dc0c",
      expiresAt: "2026-08-09T10:10:00.000Z",
      resendAvailableAt: "2026-08-09T10:01:00.000Z",
    };
    jest.mocked(authApi.signUp).mockResolvedValueOnce(response);

    const { result } = renderHook(() => useCreateAccount(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(result.current.createAccount(input)).resolves.toEqual(response);
    });

    expect(authApi.signUp).toHaveBeenCalledWith(input);
    expect(result.current.isCreating).toBe(false);
  });
});
