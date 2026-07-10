import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";

import { useCreateAccount } from "@/features/auth/useCreateAccount";

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

  it("resolves locally", async () => {
    const { result } = renderHook(() => useCreateAccount(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.createAccount(input);
    });

    expect(result.current.isCreating).toBe(false);
  });
});
