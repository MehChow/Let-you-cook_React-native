import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import type { AuthConcurrencyHooks } from "../auth/concurrencyHooks";
import { createEmailVerificationService } from "../auth/emailVerification";
import { createPasswordResetService } from "../auth/passwordReset";
import { createAuthSessionService } from "../auth/sessions";
import {
  authChallengeConfirmationSchema,
  authChallengeRequestSchema,
  authCredentialsSchema,
  passwordResetCompletionSchema,
  refreshTokenInputSchema,
  signUpInputSchema,
} from "../contracts/auth";
import { db } from "../db/client";
import type { EmailSender } from "../email/emailSender";
import { errorResponse, validationErrorHook } from "../http/errors";
import type { RequestIdEnv } from "../http/requestId";
import {
  createAuthRateLimitMiddleware,
  type AuthRateLimitOptions,
} from "../auth/rateLimit";

// Identifies duplicate emails from only the users email index.
export const isUsersEmailUniqueViolation = (error: unknown): boolean => {
  const databaseError =
    typeof error === "object" &&
    error !== null &&
    "cause" in error &&
    error.cause !== undefined
      ? error.cause
      : error;

  return (
    typeof databaseError === "object" &&
    databaseError !== null &&
    "code" in databaseError &&
    databaseError.code === "23505" &&
    "constraint" in databaseError &&
    databaseError.constraint === "users_email_unique"
  );
};

// Creates auth routes with application-owned email delivery injected.
export const createAuthRoutes = (
  emailSender: EmailSender,
  rateLimitOptions?: AuthRateLimitOptions,
  database: typeof db = db,
  concurrencyHooks: AuthConcurrencyHooks = {},
) => {
  const emailVerification = createEmailVerificationService({
    emailSender,
    database,
  });
  const passwordReset = createPasswordResetService({
    emailSender,
    database,
    afterAccountLock: concurrencyHooks.afterPasswordResetAccountLock,
  });
  const sessions = createAuthSessionService({
    database,
    afterRefreshLookup: concurrencyHooks.afterRefreshLookup,
  });

  return new Hono<RequestIdEnv>()
  .use("*", createAuthRateLimitMiddleware(rateLimitOptions))
  .post(
    "/signup",
    zValidator("json", signUpInputSchema, validationErrorHook),
    async (c) => {
      const body = c.req.valid("json");
      try {
        const challenge = await emailVerification.register(body);
        return c.json(challenge, 201);
      } catch (error) {
        if (isUsersEmailUniqueViolation(error)) {
          return errorResponse(c, "email_already_registered");
        }

        throw error;
      }
    },
  )
  .post(
    "/login",
    zValidator("json", authCredentialsSchema, validationErrorHook),
    async (c) => {
      const result = await sessions.login(c.req.valid("json"));
      return result.ok
        ? c.json(result.session, 200)
        : errorResponse(c, result.error);
    },
  )
  .post(
    "/email-verification/requests",
    zValidator("json", authChallengeRequestSchema, validationErrorHook),
    async (c) => {
      const challenge = await emailVerification.request(c.req.valid("json").email);
      return c.json(challenge, 202);
    },
  )
  .post(
    "/email-verification/confirmations",
    zValidator("json", authChallengeConfirmationSchema, validationErrorHook),
    async (c) => {
      const { challengeId, code } = c.req.valid("json");
      const result = await emailVerification.confirm(challengeId, code);

      return result.ok && result.session
        ? c.json(result.session, 200)
        : errorResponse(c, "invalid_auth_challenge");
    },
  )
  .post(
    "/password-reset/requests",
    zValidator("json", authChallengeRequestSchema, validationErrorHook),
    async (c) => {
      const challenge = await passwordReset.request(c.req.valid("json").email);
      return c.json(challenge, 202);
    },
  )
  .post(
    "/password-reset/verifications",
    zValidator("json", authChallengeConfirmationSchema, validationErrorHook),
    async (c) => {
      const { challengeId, code } = c.req.valid("json");
      const grant = await passwordReset.verify(challengeId, code);
      return grant
        ? c.json(grant, 200)
        : errorResponse(c, "invalid_auth_challenge");
    },
  )
  .post(
    "/password-reset/completions",
    zValidator("json", passwordResetCompletionSchema, validationErrorHook),
    async (c) => {
      const { resetGrant, password } = c.req.valid("json");
      const completion = await passwordReset.complete(resetGrant, password);
      return completion
        ? c.json(completion, 200)
        : errorResponse(c, "invalid_password_reset_grant");
    },
  )
  .post(
    "/refresh",
    zValidator("json", refreshTokenInputSchema, validationErrorHook),
    async (c) => {
      const result = await sessions.refresh(c.req.valid("json").refreshToken);
      return result.ok
        ? c.json(result.tokens, 200)
        : errorResponse(c, result.error);
    },
  )
  .post(
    "/logout",
    zValidator("json", refreshTokenInputSchema, validationErrorHook),
    async (c) => {
      const result = await sessions.logout(c.req.valid("json").refreshToken);
      return c.json(result, 200);
    },
  );
};
