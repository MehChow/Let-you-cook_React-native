import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import type { StoredAuthSession } from "./authTypes";
import {
  authApi,
  type AuthChallengeConfirmation,
  type AuthChallengeResponse,
  type AuthResponse,
} from "./api";
import {
  authSessionInvalidation,
  createAuthSession,
  isAccessTokenExpired,
  restoreAuthSession,
} from "./session";
import { authTokenStorage } from "./tokenStorage";

interface AuthContextValue {
  isHydrating: boolean;
  isLoggedIn: boolean;
  session: StoredAuthSession | null;
  establishSession(response: AuthResponse): Promise<void>;
  requestEmailVerification(email: string): Promise<AuthChallengeResponse>;
  confirmEmailVerification(input: AuthChallengeConfirmation): Promise<void>;
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

  useEffect(
    () => authSessionInvalidation.subscribe(() => setSession(null)),
    [],
  );

  useEffect(() => {
    let mounted = true;

    // Restores valid credentials and refreshes expired access once.
    const hydrate = async () => {
      try {
        const nextSession = await restoreAuthSession({
          getSession: authTokenStorage.getSession,
          refresh: authApi.refresh,
          saveSession: authTokenStorage.saveSession,
          clearTokens: authTokenStorage.clearTokens,
        });

        if (mounted) {
          if (nextSession) {
            authSessionInvalidation.reset();
          }
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

  // Revokes the current refresh token before clearing local state.
  const logout = async () => {
    try {
      if (session?.tokens.refreshToken) {
        await authApi.logout({ refreshToken: session.tokens.refreshToken });
      }
    } catch {
      // Revocation is best-effort when the backend is unreachable.
    } finally {
      try {
        await authTokenStorage.clearTokens();
      } finally {
        setSession(null);
      }
    }
  };

  // Converts and persists a successful server authentication response.
  const establishSession = async (response: AuthResponse) => {
    const nextSession = createAuthSession(response);
    await authTokenStorage.saveSession(nextSession);
    authSessionInvalidation.reset();
    setSession(nextSession);
  };

  // Requests a generic resumable verification challenge for one email.
  const requestEmailVerification = (email: string) =>
    authApi.requestEmailVerification({ email });

  // Confirms email ownership and persists the first issued full session.
  const confirmEmailVerification = async (input: AuthChallengeConfirmation) => {
    const response = await authApi.confirmEmailVerification(input);
    await establishSession(response);
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
        requestEmailVerification,
        confirmEmailVerification,
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
