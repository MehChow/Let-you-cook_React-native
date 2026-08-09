import { renderHook, waitFor } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";

import { AuthProvider, useAuth } from "@/features/auth/AuthProvider";
import { authApi } from "@/features/auth/api";
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
    sendPasswordResetCode: jest.fn(),
  },
}));

const mockGetSession = authTokenStorage.getSession as jest.Mock;
const mockSaveSession = authTokenStorage.saveSession as jest.Mock;
const mockClearTokens = authTokenStorage.clearTokens as jest.Mock;
const mockRefresh = authApi.refresh as jest.Mock;

// Supplies the authentication provider to hook tests.
const wrapper = ({ children }: PropsWithChildren) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue(expiredSession);
    mockRefresh.mockResolvedValue({
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });
    mockSaveSession.mockResolvedValue(undefined);
    mockClearTokens.mockResolvedValue(undefined);
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
});
