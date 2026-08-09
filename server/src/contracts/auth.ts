import { z } from "zod";

import { isoTimestampSchema } from "./common";

export const authCredentialsSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(20),
});

export const signUpInputSchema = authCredentialsSchema.extend({
  displayName: z.string().min(1).max(80).optional(),
});

export const authChallengeRequestSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
});

export const authChallengeConfirmationSchema = z.object({
  challengeId: z.uuid(),
  code: z.string().regex(/^\d{6}$/),
});

export const passwordResetCompletionSchema = z.object({
  resetGrant: z.string().min(1),
  password: z.string().min(8).max(20),
});

export const refreshTokenInputSchema = z.object({
  refreshToken: z.string().min(1),
});

export const authUserSchema = z.strictObject({
  id: z.uuid(),
  email: z.email(),
});

export const authTokensSchema = z.strictObject({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export const authSessionResponseSchema = z.strictObject({
  user: authUserSchema,
  tokens: authTokensSchema,
});

export const authChallengeResponseSchema = z.strictObject({
  ok: z.literal(true),
  challengeId: z.uuid(),
  expiresAt: isoTimestampSchema,
  resendAvailableAt: isoTimestampSchema,
});

export const passwordResetGrantResponseSchema = z.strictObject({
  resetGrant: z.string().min(1),
  expiresAt: isoTimestampSchema,
});

export const passwordResetCompletionResponseSchema = z.strictObject({
  ok: z.literal(true),
});

export const logoutResponseSchema = z.strictObject({
  ok: z.literal(true),
});

export type AuthCredentials = z.infer<typeof authCredentialsSchema>;
export type SignUpInput = z.infer<typeof signUpInputSchema>;
export type AuthChallengeRequest = z.infer<typeof authChallengeRequestSchema>;
export type AuthChallengeConfirmation = z.infer<
  typeof authChallengeConfirmationSchema
>;
export type PasswordResetCompletion = z.infer<
  typeof passwordResetCompletionSchema
>;
export type RefreshTokenInput = z.infer<typeof refreshTokenInputSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthTokens = z.infer<typeof authTokensSchema>;
export type AuthSessionResponse = z.infer<
  typeof authSessionResponseSchema
>;
export type AuthChallengeResponse = z.infer<
  typeof authChallengeResponseSchema
>;
export type PasswordResetGrantResponse = z.infer<
  typeof passwordResetGrantResponseSchema
>;
export type PasswordResetCompletionResponse = z.infer<
  typeof passwordResetCompletionResponseSchema
>;
export type LogoutResponse = z.infer<typeof logoutResponseSchema>;
