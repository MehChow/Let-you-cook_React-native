import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react-native";

import { PASSWORD_RESET_COOLDOWN_KEY } from "@/features/auth/passwordResetCooldownCore";
import { usePasswordResetCooldown, useSendPasswordResetCode } from "@/features/auth/useSendPasswordResetCode";

const mockValues = new Map<string, number>();
const mockStrings = new Map<string, string>();
const mockSendPasswordResetCode = jest.fn();
const mockQueryClients: QueryClient[] = [];

jest.mock("react-native-mmkv", () => ({
  createMMKV: () => ({
    getNumber: (key: string) => mockValues.get(key),
    getString: (key: string) => mockStrings.get(key),
    set: (key: string, value: number | string) => {
      if (typeof value === "number") {
        mockValues.set(key, value);
      } else {
        mockStrings.set(key, value);
      }
    },
    setString: (key: string, value: string) => mockStrings.set(key, value),
    remove: (key: string) => {
      mockValues.delete(key);
      mockStrings.delete(key);
    },
  }),
}));

jest.mock("@/features/auth/useAuth", () => ({
  useAuth: () => ({ sendPasswordResetCode: mockSendPasswordResetCode }),
}));

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { mutations: { gcTime: 0, retry: false } },
  });
  mockQueryClients.push(client);

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe("password reset send hooks", () => {
  beforeEach(() => {
    mockValues.clear();
    mockStrings.clear();
    mockSendPasswordResetCode.mockReset();
    jest.useRealTimers();
  });

  afterEach(() => {
    cleanup();
    mockQueryClients.forEach((client) => client.clear());
    mockQueryClients.length = 0;
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("blocks the API while the persisted cooldown is active", async () => {
    mockValues.set(PASSWORD_RESET_COOLDOWN_KEY, Date.now() + 60_000);
    mockStrings.set("auth.password-reset.email", "cook@example.com");
    const { result } = renderHook(() => useSendPasswordResetCode(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(result.current.sendCode("cook@example.com")).rejects.toThrow(
        "Please wait before requesting another code.",
      );
    });
    expect(mockSendPasswordResetCode).not.toHaveBeenCalled();
  });

  it("still blocks a legacy timestamp that has no pending email", async () => {
    mockValues.set(PASSWORD_RESET_COOLDOWN_KEY, Date.now() + 60_000);
    const { result } = renderHook(() => useSendPasswordResetCode(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(result.current.sendCode("cook@example.com")).rejects.toThrow(
        "Please wait before requesting another code.",
      );
    });
    expect(mockSendPasswordResetCode).not.toHaveBeenCalled();
  });

  it("starts the cooldown only after a successful send", async () => {
    mockSendPasswordResetCode.mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useSendPasswordResetCode(), {
      wrapper: createWrapper(),
    });

    const before = Date.now();
    await act(async () => {
      await result.current.sendCode("cook@example.com");
    });

    expect(mockValues.get(PASSWORD_RESET_COOLDOWN_KEY)).toBeGreaterThanOrEqual(before + 60_000);
    expect(mockSendPasswordResetCode).toHaveBeenCalledWith("cook@example.com");
  });

  it("starts the cooldown immediately while the send request is pending", async () => {
    let resolveRequest: (() => void) | undefined;
    mockSendPasswordResetCode.mockImplementation(
      () => new Promise<{ ok: true }>((resolve) => {
        resolveRequest = () => resolve({ ok: true });
      }),
    );
    const { result } = renderHook(() => useSendPasswordResetCode(), {
      wrapper: createWrapper(),
    });

    const request = result.current.sendCode("cook@example.com");
    await waitFor(() => expect(mockSendPasswordResetCode).toHaveBeenCalled());
    expect(mockValues.get(PASSWORD_RESET_COOLDOWN_KEY)).toBeGreaterThanOrEqual(
      Date.now() + 59_000,
    );

    resolveRequest?.();
    await request;
  });

  it("does not start the cooldown when sending fails", async () => {
    mockSendPasswordResetCode.mockRejectedValue(new Error("Request failed"));
    const { result } = renderHook(() => useSendPasswordResetCode(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(result.current.sendCode("cook@example.com")).rejects.toThrow("Request failed");
    });
    expect(mockValues.has(PASSWORD_RESET_COOLDOWN_KEY)).toBe(false);
  });

  it("allows only one concurrent send", async () => {
    let resolveRequest: (() => void) | undefined;
    mockSendPasswordResetCode.mockImplementation(
      () => new Promise<{ ok: true }>((resolve) => {
        resolveRequest = () => resolve({ ok: true });
      }),
    );
    const { result } = renderHook(() => useSendPasswordResetCode(), {
      wrapper: createWrapper(),
    });

    let firstRequest: Promise<void> | undefined;
    await act(async () => {
      firstRequest = result.current.sendCode("cook@example.com");
      await expect(result.current.sendCode("cook@example.com")).rejects.toThrow(
        "Another code request is already in progress.",
      );
    });

    expect(mockSendPasswordResetCode).toHaveBeenCalledTimes(1);
    resolveRequest?.();
    await firstRequest;
  });

  it("restores the remaining cooldown from persisted time", async () => {
    jest.useFakeTimers();
    const now = Date.now();
    mockValues.set(PASSWORD_RESET_COOLDOWN_KEY, now + 5_000);
    const { result, unmount } = renderHook(() => usePasswordResetCooldown(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.remainingSeconds).toBe(5));
    act(() => jest.advanceTimersByTime(1_000));
    await waitFor(() => expect(result.current.remainingSeconds).toBe(4));
    unmount();
  });

  it("restarts the visible cooldown when resending after expiry", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(1_000_000);
    mockSendPasswordResetCode.mockResolvedValue({ ok: true });

    const { result } = renderHook(
      () => ({
        sender: useSendPasswordResetCode(),
        cooldown: usePasswordResetCooldown(),
      }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.sender.sendCode("cook@example.com");
    });
    expect(result.current.cooldown.remainingSeconds).toBe(60);

    act(() => jest.advanceTimersByTime(60_000));
    await waitFor(() => expect(result.current.cooldown.remainingSeconds).toBe(0));

    await act(async () => {
      await result.current.sender.sendCode("cook@example.com");
    });

    expect(result.current.cooldown.remainingSeconds).toBe(60);
  });
});
