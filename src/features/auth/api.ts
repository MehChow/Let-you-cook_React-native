import { appEnv } from "@/config/env";

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpInput extends AuthCredentials {
  displayName?: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface LogoutResponse {
  ok: boolean;
}

export interface PasswordResetCodeInput {
  email: string;
}

interface AuthApiOptions {
  baseUrl?: string;
  fetch?: typeof fetch;
}

// Represents a safe authentication failure returned to mobile screens.
export class AuthApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

// Extracts a safe user-facing message from failed responses.
const readErrorMessage = async (response: Response) => {
  const body = (await response.json().catch(() => null)) as { message?: unknown } | null;
  return typeof body?.message === "string" ? body.message : "Request failed";
};

// Sends JSON and converts failed responses into authentication errors.
const postJson = async <Result>(
  fetchImpl: typeof fetch,
  baseUrl: string,
  path: string,
  body: unknown,
): Promise<Result> => {
  const response = await fetchImpl(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new AuthApiError(await readErrorMessage(response), response.status);
  }

  return (await response.json()) as Result;
};

// Creates authentication operations against the configured backend URL.
export const createAuthApi = (options: AuthApiOptions = {}) => {
  const baseUrl = (options.baseUrl ?? appEnv.apiBaseUrl).replace(/\/$/, "");
  const fetchImpl = options.fetch ?? fetch;

  return {
    signUp: (body: SignUpInput) => postJson<AuthResponse>(fetchImpl, baseUrl, "/auth/signup", body),
    login: (body: AuthCredentials) => postJson<AuthResponse>(fetchImpl, baseUrl, "/auth/login", body),
    refresh: (body: RefreshTokenInput) =>
      postJson<AuthTokens>(fetchImpl, baseUrl, "/auth/refresh", body),
    logout: (body: RefreshTokenInput) =>
      postJson<LogoutResponse>(fetchImpl, baseUrl, "/auth/logout", body),
    sendPasswordResetCode: async (body: PasswordResetCodeInput) => {
      if (!body.email.trim()) {
        throw new Error("Enter your email address.");
      }

      return { ok: true as const };
    },
  };
};

export const authApi = createAuthApi();
