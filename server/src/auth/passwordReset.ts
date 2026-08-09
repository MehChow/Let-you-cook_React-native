import {
  createHmac,
  randomBytes,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";

import { and, desc, eq, isNull, sql } from "drizzle-orm";

import { hashPassword } from "./password";
import {
  authChallengeResponseSchema,
  passwordResetCompletionResponseSchema,
  passwordResetGrantResponseSchema,
  type AuthChallengeResponse,
  type PasswordResetCompletionResponse,
  type PasswordResetGrantResponse,
} from "../contracts/auth";
import { getRequiredEnv } from "../config";
import { db } from "../db/client";
import { authChallenges, refreshTokens, users } from "../db/schema";
import type { EmailSender } from "../email/emailSender";

const PASSWORD_RESET_PURPOSE = "password_reset";
const CHALLENGE_TTL_MS = 10 * 60 * 1_000;
const RESET_GRANT_TTL_MS = 10 * 60 * 1_000;
const RESEND_COOLDOWN_MS = 60 * 1_000;
const MAX_CHALLENGE_ATTEMPTS = 5;

type AuthTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

interface PasswordResetServiceOptions {
  emailSender: EmailSender;
  secret?: string;
  now?: () => Date;
  generateCode?: () => string;
  generateGrant?: () => string;
}

interface ResetRecipient {
  id: string;
  email: string;
}

// Produces a cryptographically random six-digit password-reset code.
const generateOtp = () => randomInt(0, 1_000_000).toString().padStart(6, "0");

// Produces an opaque high-entropy password-reset bearer grant.
const generateResetGrant = () => randomBytes(32).toString("base64url");

// Adds milliseconds without mutating a transaction timestamp.
const addMilliseconds = (value: Date, milliseconds: number) =>
  new Date(value.getTime() + milliseconds);

// Compares fixed-length keyed hashes without content-dependent timing.
const hashesMatch = (left: string, right: string) => {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
};

// Builds the complete password-reset challenge and grant lifecycle.
export const createPasswordResetService = ({
  emailSender,
  secret = process.env.AUTH_CHALLENGE_SECRET ?? getRequiredEnv("JWT_SECRET"),
  now = () => new Date(),
  generateCode = generateOtp,
  generateGrant = generateResetGrant,
}: PasswordResetServiceOptions) => {
  // Produces a purpose-separated keyed digest for persisted reset secrets.
  const hashValue = (scope: string, value: string) =>
    createHmac("sha256", secret)
      .update(`${PASSWORD_RESET_PURPOSE}:${scope}:${value}`)
      .digest("base64url");

  // Projects stored timestamps into generic resumable response state.
  const toChallengeResponse = (challenge: {
    id: string;
    expiresAt: Date;
    lastSentAt: Date;
  }): AuthChallengeResponse =>
    authChallengeResponseSchema.parse({
      ok: true,
      challengeId: challenge.id,
      expiresAt: challenge.expiresAt.toISOString(),
      resendAvailableAt: addMilliseconds(
        challenge.lastSentAt,
        RESEND_COOLDOWN_MS,
      ).toISOString(),
    });

  // Issues or reuses one reset challenge under a target-level lock.
  const issueChallenge = async (
    tx: AuthTransaction,
    normalizedEmail: string,
    recipient: ResetRecipient | null,
  ): Promise<AuthChallengeResponse> => {
    const sentAt = now();
    const targetHash = hashValue("target", normalizedEmail);

    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtextextended(${`${PASSWORD_RESET_PURPOSE}:${targetHash}`}, 0))`,
    );
    const [latest] = await tx
      .select({
        id: authChallenges.id,
        expiresAt: authChallenges.expiresAt,
        lastSentAt: authChallenges.lastSentAt,
        consumedAt: authChallenges.consumedAt,
      })
      .from(authChallenges)
      .where(
        and(
          eq(authChallenges.purpose, PASSWORD_RESET_PURPOSE),
          eq(authChallenges.targetHash, targetHash),
        ),
      )
      .orderBy(desc(authChallenges.lastSentAt))
      .limit(1);

    if (
      latest &&
      !latest.consumedAt &&
      addMilliseconds(latest.lastSentAt, RESEND_COOLDOWN_MS) > sentAt
    ) {
      return toChallengeResponse(latest);
    }

    await tx
      .update(authChallenges)
      .set({ consumedAt: sentAt })
      .where(
        and(
          eq(authChallenges.purpose, PASSWORD_RESET_PURPOSE),
          eq(authChallenges.targetHash, targetHash),
          isNull(authChallenges.consumedAt),
        ),
      );

    const challengeId = randomUUID();
    const code = generateCode();
    const expiresAt = addMilliseconds(sentAt, CHALLENGE_TTL_MS);
    const [challenge] = await tx
      .insert(authChallenges)
      .values({
        id: challengeId,
        userId: recipient?.id ?? null,
        purpose: PASSWORD_RESET_PURPOSE,
        targetHash,
        codeHash: hashValue(challengeId, code),
        expiresAt,
        lastSentAt: sentAt,
      })
      .returning({
        id: authChallenges.id,
        expiresAt: authChallenges.expiresAt,
        lastSentAt: authChallenges.lastSentAt,
      });

    if (recipient) {
      await emailSender.send({
        to: recipient.email,
        subject: "Reset your Let You Cook password",
        text: `Your Let You Cook password reset code is ${code}. It expires in 10 minutes.`,
      });
    }

    return toChallengeResponse(challenge);
  };

  // Starts a generic reset request without revealing account existence.
  const request = async (normalizedEmail: string) =>
    db.transaction(async (tx) => {
      const [user] = await tx
        .select({
          id: users.id,
          email: users.email,
          emailVerifiedAt: users.emailVerifiedAt,
        })
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);
      const recipient = user?.emailVerifiedAt
        ? { id: user.id, email: user.email }
        : null;
      return issueChallenge(tx, normalizedEmail, recipient);
    });

  // Consumes a valid reset OTP and returns one short-lived bearer grant.
  const verify = async (
    challengeId: string,
    code: string,
  ): Promise<PasswordResetGrantResponse | null> =>
    db.transaction(async (tx) => {
      const verifiedAt = now();
      const [challenge] = await tx
        .select()
        .from(authChallenges)
        .where(
          and(
            eq(authChallenges.id, challengeId),
            eq(authChallenges.purpose, PASSWORD_RESET_PURPOSE),
          ),
        )
        .limit(1)
        .for("update");

      if (
        !challenge?.userId ||
        challenge.consumedAt ||
        challenge.expiresAt <= verifiedAt ||
        challenge.attemptCount >= MAX_CHALLENGE_ATTEMPTS
      ) {
        return null;
      }

      if (!hashesMatch(challenge.codeHash, hashValue(challenge.id, code))) {
        const attemptCount = challenge.attemptCount + 1;
        await tx
          .update(authChallenges)
          .set({
            attemptCount,
            ...(attemptCount >= MAX_CHALLENGE_ATTEMPTS
              ? { consumedAt: verifiedAt }
              : {}),
          })
          .where(eq(authChallenges.id, challenge.id));
        return null;
      }

      const resetGrant = generateGrant();
      const expiresAt = addMilliseconds(verifiedAt, RESET_GRANT_TTL_MS);
      await tx
        .update(authChallenges)
        .set({
          consumedAt: verifiedAt,
          grantHash: hashValue("grant", resetGrant),
          grantExpiresAt: expiresAt,
        })
        .where(eq(authChallenges.id, challenge.id));

      return passwordResetGrantResponseSchema.parse({
        resetGrant,
        expiresAt: expiresAt.toISOString(),
      });
    });

  // Changes the password and revokes every refresh session atomically.
  const complete = async (
    resetGrant: string,
    password: string,
  ): Promise<PasswordResetCompletionResponse | null> => {
    const passwordHash = await hashPassword(password);

    return db.transaction(async (tx) => {
      const completedAt = now();
      const [challenge] = await tx
        .select({
          id: authChallenges.id,
          userId: authChallenges.userId,
          grantExpiresAt: authChallenges.grantExpiresAt,
          grantConsumedAt: authChallenges.grantConsumedAt,
        })
        .from(authChallenges)
        .where(
          and(
            eq(authChallenges.purpose, PASSWORD_RESET_PURPOSE),
            eq(authChallenges.grantHash, hashValue("grant", resetGrant)),
          ),
        )
        .limit(1)
        .for("update");

      if (
        !challenge?.userId ||
        challenge.grantConsumedAt ||
        !challenge.grantExpiresAt ||
        challenge.grantExpiresAt <= completedAt
      ) {
        return null;
      }

      await tx
        .update(users)
        .set({ passwordHash, updatedAt: completedAt })
        .where(eq(users.id, challenge.userId));
      await tx
        .update(refreshTokens)
        .set({ revokedAt: completedAt })
        .where(
          and(
            eq(refreshTokens.userId, challenge.userId),
            isNull(refreshTokens.revokedAt),
          ),
        );
      await tx
        .update(authChallenges)
        .set({ grantConsumedAt: completedAt })
        .where(eq(authChallenges.id, challenge.id));

      return passwordResetCompletionResponseSchema.parse({ ok: true });
    });
  };

  return { request, verify, complete };
};
