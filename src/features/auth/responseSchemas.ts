import { z } from "zod";

import type {
  AccountDeletionResponse,
  AuthChallengeResponse,
  AuthResponse,
  AuthTokens,
  LogoutResponse,
  PasswordResetCompletionResponse,
  PasswordResetGrantResponse,
} from "./api";

const authUserResponseSchema = z.strictObject({
  id: z.string().min(1),
  email: z.email(),
});

export const authTokensResponseSchema: z.ZodType<AuthTokens> = z.strictObject({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export const authResponseSchema: z.ZodType<AuthResponse> = z.strictObject({
  user: authUserResponseSchema,
  tokens: authTokensResponseSchema,
});

export const authChallengeResponseSchema: z.ZodType<AuthChallengeResponse> =
  z.strictObject({
    ok: z.literal(true),
    challengeId: z.string().min(1),
    expiresAt: z.iso.datetime({ offset: false }),
    resendAvailableAt: z.iso.datetime({ offset: false }),
  });

export const logoutResponseSchema: z.ZodType<LogoutResponse> = z.strictObject({
  ok: z.literal(true),
});

export const accountDeletionResponseSchema: z.ZodType<AccountDeletionResponse> =
  z.strictObject({ ok: z.literal(true) });

export const passwordResetGrantResponseSchema: z.ZodType<PasswordResetGrantResponse> =
  z.strictObject({
    resetGrant: z.string().min(1),
    expiresAt: z.iso.datetime({ offset: false }),
  });

export const passwordResetCompletionResponseSchema: z.ZodType<PasswordResetCompletionResponse> =
  z.strictObject({ ok: z.literal(true) });
