import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import type { StoredAuthSession } from "./authTypes";
import { authApi, type AuthResponse } from "./api";
import { createAuthSession, isAccessTokenExpired } from "./session";
import { authTokenStorage } from "./tokenStorage";

interface AuthContextValue {
  isHydrating: boolean;
  isLoggedIn: boolean;
  session: StoredAuthSession | null;
  establishSession(response: AuthResponse): Promise<void>;
  logout(): Promise<void>;
  sendPasswordResetCode(email: string): Promise<void>;
  verifyOtp(code: string): Promise<void>;
  resetPassword(input: {
    password: string;
    confirmPassword: string;
  }): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Provides persisted authentication state and current session operations.
export function AuthProvider({ children }: PropsWithChildren) {
  const [isHydrating, setIsHydrating] = useState(true);
  const [session, setSession] = useState<StoredAuthSession | null>(null);

  useEffect(() => {
    let mounted = true;

    // Restores a still-valid session from secure device storage.
    const hydrate = async () => {
      try {
        const storedSession = await authTokenStorage.getSession();
        const nextSession = isAccessTokenExpired(storedSession) ? null : storedSession;

        if (!nextSession) {
          await authTokenStorage.clearTokens();
        }

        if (mounted) {
          setSession(nextSession);
        }
      } finally {
        if (mounted) {
          setIsHydrating(false);
        }
      }
    };

    void hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  // Clears the current session locally until server logout is integrated.
  const logout = async () => {
    await authTokenStorage.clearTokens();
    setSession(null);
  };

  // Converts and persists a successful server authentication response.
  const establishSession = async (response: AuthResponse) => {
    const nextSession = createAuthSession(response);
    await authTokenStorage.saveSession(nextSession);
    setSession(nextSession);
  };

  // Delegates password-reset requests to the current placeholder boundary.
  const sendPasswordResetCode = async (email: string) => {
    await authApi.sendPasswordResetCode({ email });
  };

  // Validates the simulated six-digit password-reset code format.
  const verifyOtp = async (code: string) => {
    if (!/^\d{6}$/.test(code.trim())) {
      throw new Error("Enter the 6-digit code.");
    }
  };

  // Validates the simulated password-reset completion input.
  const resetPassword: AuthContextValue["resetPassword"] = async ({
    password,
    confirmPassword,
  }) => {
    if (!password.trim()) {
      throw new Error("Enter a new password.");
    }
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isHydrating,
        isLoggedIn: !isAccessTokenExpired(session),
        session,
        establishSession,
        logout,
        sendPasswordResetCode,
        verifyOtp,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Reads authentication state from the required provider boundary.
export const useAuth = () => {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return value;
};
