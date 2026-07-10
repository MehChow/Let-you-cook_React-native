import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import type { StoredAuthSession } from "./authTypes";
import { authApi } from "./api";
import { createMockAuthSession, isAccessTokenExpired } from "./session";
import { authTokenStorage } from "./tokenStorage";

interface AuthContextValue {
  isHydrating: boolean;
  isLoggedIn: boolean;
  session: StoredAuthSession | null;
  login(input: { email: string; password: string }): Promise<void>;
  logout(): Promise<void>;
  sendPasswordResetCode(email: string): Promise<void>;
  verifyOtp(code: string): Promise<void>;
  resetPassword(input: {
    password: string;
    confirmPassword: string;
  }): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isHydrating, setIsHydrating] = useState(true);
  const [session, setSession] = useState<StoredAuthSession | null>(null);

  useEffect(() => {
    let mounted = true;

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

  const login: AuthContextValue["login"] = async ({ email, password }) => {
    if (!email.trim() || !password.trim()) {
      throw new Error("Enter your email and password.");
    }

    const nextSession = createMockAuthSession({ email });
    await authTokenStorage.saveSession(nextSession);
    setSession(nextSession);
  };

  const logout = async () => {
    await authTokenStorage.clearTokens();
    setSession(null);
  };

  const sendPasswordResetCode = async (email: string) => {
    await authApi.sendPasswordResetCode({ email });
  };

  const verifyOtp = async (code: string) => {
    if (!/^\d{6}$/.test(code.trim())) {
      throw new Error("Enter the 6-digit code.");
    }
  };

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
        login,
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

export const useAuth = () => {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return value;
};
