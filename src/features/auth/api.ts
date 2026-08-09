import { appEnv } from "@/config/env";
import { apiClient } from "@/lib/apiClient";
import { apiErrorFromResponse } from "@/lib/apiError";
import type { ZodType } from "zod";

import {
  accountDeletionResponseSchema,
  authChallengeResponseSchema,
  authResponseSchema,
  authTokensResponseSchema,
  logoutResponseSchema,
  passwordResetCompletionResponseSchema,
  passwordResetGrantResponseSchema,
} from "./responseSchemas";

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

export interface AuthChallengeResponse {
  ok: true;
  challengeId: string;
  expiresAt: string;
  resendAvailableAt: string;
}

export interface AuthChallengeRequest {
  email: string;
}

export interface AuthChallengeConfirmation {
  challengeId: string;
  code: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface LogoutResponse {
  ok: boolean;
}

export interface AccountDeletionResponse {
  ok: true;
}

export interface PasswordResetGrantResponse {
  resetGrant: string;
  expiresAt: string;
}

export interface PasswordResetCompletionInput {
  resetGrant: string;
  password: string;
}

export interface PasswordResetCompletionResponse {
  ok: true;
}

interface AuthApiOptions {
  baseUrl?: string;
  fetch?: typeof fetch;
  request?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

// Sends JSON and converts failed responses into authentication errors.
const postJson = async <Result>(
  fetchImpl: typeof fetch,
  baseUrl: string,
  path: string,
  body: unknown,
  responseSchema: ZodType<Result>,
): Promise<Result> => {
  const response = await fetchImpl(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw await apiErrorFromResponse(response);
  }

  return responseSchema.parse(await response.json());
};

// Deletes the authenticated account through the shared token-aware transport.
const deleteAccount = async (
  request: NonNullable<AuthApiOptions["request"]>,
): Promise<AccountDeletionResponse> => {
  const response = await request("/v1/users/me", { method: "DELETE" });

  if (!response.ok) {
    throw await apiErrorFromResponse(response);
  }

  return accountDeletionResponseSchema.parse(await response.json());
};

// Creates authentication operations against the configured backend URL.
export const createAuthApi = (options: AuthApiOptions = {}) => {
  const baseUrl = (options.baseUrl ?? appEnv.apiBaseUrl).replace(/\/$/, "");
  const fetchImpl = options.fetch ?? fetch;
  const request = options.request ?? apiClient.request;

  return {
    signUp: (body: SignUpInput) =>
      postJson<AuthChallengeResponse>(
        fetchImpl,
        baseUrl,
        "/v1/auth/signup",
        body,
        authChallengeResponseSchema,
      ),
    login: (body: AuthCredentials) =>
      postJson<AuthResponse>(
        fetchImpl,
        baseUrl,
        "/v1/auth/login",
        body,
        authResponseSchema,
      ),
    refresh: (body: RefreshTokenInput) =>
      postJson<AuthTokens>(
        fetchImpl,
        baseUrl,
        "/v1/auth/refresh",
        body,
        authTokensResponseSchema,
      ),
    logout: (body: RefreshTokenInput) =>
      postJson<LogoutResponse>(
        fetchImpl,
        baseUrl,
        "/v1/auth/logout",
        body,
        logoutResponseSchema,
      ),
    requestEmailVerification: (body: AuthChallengeRequest) =>
      postJson<AuthChallengeResponse>(
        fetchImpl,
        baseUrl,
        "/v1/auth/email-verification/requests",
        body,
        authChallengeResponseSchema,
      ),
    confirmEmailVerification: (body: AuthChallengeConfirmation) =>
      postJson<AuthResponse>(
        fetchImpl,
        baseUrl,
        "/v1/auth/email-verification/confirmations",
        body,
        authResponseSchema,
      ),
    requestPasswordReset: (body: AuthChallengeRequest) =>
      postJson<AuthChallengeResponse>(
        fetchImpl,
        baseUrl,
        "/v1/auth/password-reset/requests",
        body,
        authChallengeResponseSchema,
      ),
    verifyPasswordReset: (body: AuthChallengeConfirmation) =>
      postJson<PasswordResetGrantResponse>(
        fetchImpl,
        baseUrl,
        "/v1/auth/password-reset/verifications",
        body,
        passwordResetGrantResponseSchema,
      ),
    completePasswordReset: (body: PasswordResetCompletionInput) =>
      postJson<PasswordResetCompletionResponse>(
        fetchImpl,
        baseUrl,
        "/v1/auth/password-reset/completions",
        body,
        passwordResetCompletionResponseSchema,
      ),
    deleteAccount: () => deleteAccount(request),
  };
};

export const authApi = createAuthApi();
