import { zValidator } from "@hono/zod-validator";
import { and, eq, gt, isNull } from "drizzle-orm";
import { Hono } from "hono";

import { createEmailVerificationService } from "../auth/emailVerification";
import { verifyPassword } from "../auth/password";
import {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
  refreshTokenExpiry,
} from "../auth/tokens";
import {
  authChallengeConfirmationSchema,
  authChallengeRequestSchema,
  authCredentialsSchema,
  authSessionResponseSchema,
  authTokensSchema,
  logoutResponseSchema,
  refreshTokenInputSchema,
  signUpInputSchema,
} from "../contracts/auth";
import { db } from "../db/client";
import { refreshTokens, users } from "../db/schema";
import type { EmailSender } from "../email/emailSender";
import { errorResponse, validationErrorHook } from "../http/errors";
import type { RequestIdEnv } from "../http/requestId";

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

const createTokenPair = async (userId: string) => {
  const refreshToken = createRefreshToken();
  const [row] = await db
    .insert(refreshTokens)
    .values({
      userId,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: refreshTokenExpiry(),
    })
    .returning({ id: refreshTokens.id });

  return {
    accessToken: await createAccessToken(userId),
    refreshToken,
    refreshTokenId: row.id,
  };
};

// Projects internal token metadata into the public token DTO.
const toAuthTokens = (
  tokens: Awaited<ReturnType<typeof createTokenPair>>,
) =>
  authTokensSchema.parse({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });

// Creates auth routes with application-owned email delivery injected.
export const createAuthRoutes = (emailSender: EmailSender) => {
  const emailVerification = createEmailVerificationService({ emailSender });

  return new Hono<RequestIdEnv>()
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
      const body = c.req.valid("json");
      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          passwordHash: users.passwordHash,
          emailVerifiedAt: users.emailVerifiedAt,
        })
        .from(users)
        .where(eq(users.email, body.email))
        .limit(1);

      if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
        return errorResponse(c, "invalid_credentials");
      }

      if (!user.emailVerifiedAt) {
        return errorResponse(c, "email_verification_required");
      }

      const tokens = await createTokenPair(user.id);

      return c.json(
        authSessionResponseSchema.parse({
          user: { id: user.id, email: user.email },
          tokens: toAuthTokens(tokens),
        }),
        200,
      );
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
    "/refresh",
    zValidator("json", refreshTokenInputSchema, validationErrorHook),
    async (c) => {
      const tokenHash = hashRefreshToken(c.req.valid("json").refreshToken);
      const [currentToken] = await db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.tokenHash, tokenHash))
        .limit(1);

      if (!currentToken) {
        return errorResponse(c, "invalid_refresh_token");
      }

      if (currentToken.revokedAt) {
        await db
          .update(refreshTokens)
          .set({ revokedAt: new Date() })
          .where(
            and(
              eq(refreshTokens.userId, currentToken.userId),
              isNull(refreshTokens.revokedAt),
            ),
          );
        return errorResponse(c, "refresh_token_reuse_detected");
      }

      const [activeToken] = await db
        .select()
        .from(refreshTokens)
        .where(
          and(
            eq(refreshTokens.id, currentToken.id),
            isNull(refreshTokens.revokedAt),
            gt(refreshTokens.expiresAt, new Date()),
          ),
        )
        .limit(1);

      if (!activeToken) {
        return errorResponse(c, "refresh_token_expired");
      }

      const tokens = await createTokenPair(currentToken.userId);
      await db
        .update(refreshTokens)
        .set({
          revokedAt: new Date(),
          replacedByTokenId: tokens.refreshTokenId,
        })
        .where(eq(refreshTokens.id, currentToken.id));

      return c.json(
        authTokensSchema.parse({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }),
        200,
      );
    },
  )
  .post(
    "/logout",
    zValidator("json", refreshTokenInputSchema, validationErrorHook),
    async (c) => {
      await db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(
          eq(
            refreshTokens.tokenHash,
            hashRefreshToken(c.req.valid("json").refreshToken),
          ),
        );

      return c.json(logoutResponseSchema.parse({ ok: true }), 200);
    },
  );
};
