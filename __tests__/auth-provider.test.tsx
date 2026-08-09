import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";

import { AuthProvider, useAuth } from "@/features/auth/AuthProvider";
import { authApi } from "@/features/auth/api";
import { authSessionInvalidation } from "@/features/auth/session";
import { authTokenStorage } from "@/features/auth/tokenStorage";

const expiredSession = {
  user: { id: "user-1", email: "cook@example.com" },
  tokens: { accessToken: "expired-access", refreshToken: "old-refresh" },
  accessTokenExpiresAt: 0,
};

jest.mock("@/features/auth/tokenStorage", () => ({
  authTokenStorage: {
    getSession: jest.fn(),
    saveSession: jest.fn(),
    clearTokens: jest.fn(),
  },
}));

jest.mock("@/features/auth/api", () => ({
  authApi: {
    refresh: jest.fn(),
    logout: jest.fn(),
    requestEmailVerification: jest.fn(),
    confirmEmailVerification: jest.fn(),
    sendPasswordResetCode: jest.fn(),
  },
}));

const mockGetSession = authTokenStorage.getSession as jest.Mock;
const mockSaveSession = authTokenStorage.saveSession as jest.Mock;
const mockClearTokens = authTokenStorage.clearTokens as jest.Mock;
const mockRefresh = authApi.refresh as jest.Mock;
const mockLogout = authApi.logout as jest.Mock;
const mockRequestEmailVerification = authApi.requestEmailVerification as jest.Mock;
const mockConfirmEmailVerification = authApi.confirmEmailVerification as jest.Mock;

// Supplies the authentication provider to hook tests.
const wrapper = ({ children }: PropsWithChildren) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authSessionInvalidation.reset();
    mockGetSession.mockResolvedValue(expiredSession);
    mockRefresh.mockResolvedValue({
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });
    mockSaveSession.mockResolvedValue(undefined);
    mockClearTokens.mockResolvedValue(undefined);
    mockLogout.mockResolvedValue({ ok: true });
    mockRequestEmailVerification.mockResolvedValue({
      ok: true,
      challengeId: "challenge-1",
      expiresAt: "2026-08-09T10:10:00.000Z",
      resendAvailableAt: "2026-08-09T10:01:00.000Z",
    });
  });

  it("hydrates an expired session through the refresh boundary", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isHydrating).toBe(false));

    expect(mockRefresh).toHaveBeenCalledTimes(1);
    expect(mockRefresh).toHaveBeenCalledWith({ refreshToken: "old-refresh" });
    expect(mockSaveSession).toHaveBeenCalledTimes(1);
    expect(result.current.session?.tokens).toEqual({
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });
    expect(result.current.isLoggedIn).toBe(true);
  });

  it("leaves the private session once when refresh invalidates it", async () => {
    mockGetSession.mockResolvedValue({
      ...expiredSession,
      accessTokenExpiresAt: Number.MAX_SAFE_INTEGER,
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isHydrating).toBe(false));

    act(() => {
      authSessionInvalidation.notify();
      authSessionInvalidation.notify();
    });

    expect(result.current.session).toBeNull();
    expect(result.current.isLoggedIn).toBe(false);
  });

  it("revokes the stored refresh token before clearing logout state", async () => {
    mockGetSession.mockResolvedValue({
      ...expiredSession,
      accessTokenExpiresAt: Number.MAX_SAFE_INTEGER,
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isHydrating).toBe(false));

    await act(async () => {
      await result.current.logout();
    });

    expect(mockLogout).toHaveBeenCalledWith({ refreshToken: "old-refresh" });
    expect(mockClearTokens).toHaveBeenCalledTimes(1);
    expect(result.current.session).toBeNull();
  });

  it("clears logout state when refresh-token revocation is unreachable", async () => {
    mockGetSession.mockResolvedValue({
      ...expiredSession,
      accessTokenExpiresAt: Number.MAX_SAFE_INTEGER,
    });
    mockLogout.mockRejectedValue(new TypeError("Network request failed"));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isHydrating).toBe(false));

    await act(async () => {
      await expect(result.current.logout()).resolves.toBeUndefined();
    });

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockClearTokens).toHaveBeenCalledTimes(1);
    expect(result.current.session).toBeNull();
    expect(result.current.isLoggedIn).toBe(false);
  });

  it("requests a resumable email-verification challenge", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isHydrating).toBe(false));

    await act(async () => {
      await result.current.requestEmailVerification("cook@example.com");
    });

    expect(mockRequestEmailVerification).toHaveBeenCalledWith({
      email: "cook@example.com",
    });
  });

  it("establishes the first session only after email confirmation", async () => {
    const response = {
      user: { id: "user-1", email: "cook@example.com" },
      tokens: { accessToken: "access", refreshToken: "refresh" },
    };
    mockGetSession.mockResolvedValue(null);
    mockConfirmEmailVerification.mockResolvedValue(response);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isHydrating).toBe(false));

    await act(async () => {
      await result.current.confirmEmailVerification({
        challengeId: "challenge-1",
        code: "123456",
      });
    });

    expect(mockConfirmEmailVerification).toHaveBeenCalledWith({
      challengeId: "challenge-1",
      code: "123456",
    });
    expect(mockSaveSession).toHaveBeenCalledTimes(1);
    expect(result.current.session?.user.email).toBe("cook@example.com");
  });
});
