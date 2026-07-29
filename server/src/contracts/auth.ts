import { z } from "zod";

export const authCredentialsSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(20),
});

export const signUpInputSchema = authCredentialsSchema.extend({
  displayName: z.string().min(1).max(80).optional(),
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

export const logoutResponseSchema = z.strictObject({
  ok: z.literal(true),
});

export type AuthCredentials = z.infer<typeof authCredentialsSchema>;
export type SignUpInput = z.infer<typeof signUpInputSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenInputSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthTokens = z.infer<typeof authTokensSchema>;
export type AuthSessionResponse = z.infer<
  typeof authSessionResponseSchema
>;
export type LogoutResponse = z.infer<typeof logoutResponseSchema>;
