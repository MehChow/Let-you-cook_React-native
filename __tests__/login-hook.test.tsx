import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";

import { useLogin } from "@/features/auth/useLogin";

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
  afterEach(() => {
    cleanup();
    queryClients.forEach((client) => client.clear());
    queryClients.length = 0;
  });

  it("accepts the local demo credentials", async () => {
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.login({ email: "gg@gmail.com", password: "coffee123" });
    });

    expect(result.current.isLoggingIn).toBe(false);
  });

  it("rejects credentials that do not match the demo account", async () => {
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.login({ email: "wrong@example.com", password: "coffee123" }),
      ).rejects.toThrow("Invalid credentials.");
    });
  });
});
