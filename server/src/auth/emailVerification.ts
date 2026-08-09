import {
  createHmac,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";

import { and, desc, eq, isNull, sql } from "drizzle-orm";

import { hashPassword } from "./password";
import {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
  refreshTokenExpiry,
} from "./tokens";
import {
  authChallengeResponseSchema,
  authSessionResponseSchema,
  type AuthChallengeResponse,
  type AuthSessionResponse,
  type SignUpInput,
} from "../contracts/auth";
import { getRequiredEnv } from "../config";
import { db } from "../db/client";
import {
  authChallenges,
  profiles,
  refreshTokens,
  users,
} from "../db/schema";
import type { EmailSender } from "../email/emailSender";
import { OperationalFailure } from "../observability/operationalLogger";

const EMAIL_VERIFICATION_PURPOSE = "email_verification";
const CHALLENGE_TTL_MS = 10 * 60 * 1_000;
const RESEND_COOLDOWN_MS = 60 * 1_000;
const MAX_CHALLENGE_ATTEMPTS = 5;

type AuthTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

interface EmailVerificationServiceOptions {
  emailSender: EmailSender;
  database?: typeof db;
  secret?: string;
  now?: () => Date;
  generateCode?: () => string;
}

interface ChallengeRecipient {
  id: string;
  email: string;
}

interface IssueChallengeInput {
  recipient: ChallengeRecipient | null;
  normalizedEmail: string;
}

interface ConfirmationResult {
  ok: boolean;
  session?: AuthSessionResponse;
}

// Produces a cryptographically random six-digit one-time code.
const generateOtp = () => randomInt(0, 1_000_000).toString().padStart(6, "0");

// Adds milliseconds without mutating the caller's clock value.
const addMilliseconds = (value: Date, milliseconds: number) =>
  new Date(value.getTime() + milliseconds);

// Compares fixed-length digests without content-dependent timing.
const hashesMatch = (left: string, right: string) => {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
};

// Builds email-verification transactions around injected delivery and time.
export const createEmailVerificationService = ({
  emailSender,
  database = db,
  secret = process.env.AUTH_CHALLENGE_SECRET ?? getRequiredEnv("JWT_SECRET"),
  now = () => new Date(),
  generateCode = generateOtp,
}: EmailVerificationServiceOptions) => {
  // Produces a domain-separated keyed digest for stored challenge values.
  const hashValue = (scope: string, value: string) =>
    createHmac("sha256", secret)
      .update(`${EMAIL_VERIFICATION_PURPOSE}:${scope}:${value}`)
      .digest("base64url");

  // Projects challenge timestamps into the strict public response.
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

  // Issues or reuses one verification challenge under a transaction lock.
  const issueChallenge = async (
    tx: AuthTransaction,
    { recipient, normalizedEmail }: IssueChallengeInput,
  ): Promise<AuthChallengeResponse> => {
    const sentAt = now();
    const targetHash = hashValue("target", normalizedEmail);

    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtextextended(${`${EMAIL_VERIFICATION_PURPOSE}:${targetHash}`}, 0))`,
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
          eq(authChallenges.purpose, EMAIL_VERIFICATION_PURPOSE),
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
          eq(authChallenges.purpose, EMAIL_VERIFICATION_PURPOSE),
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
        purpose: EMAIL_VERIFICATION_PURPOSE,
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
      try {
        await emailSender.send({
          to: recipient.email,
          subject: "Verify your Let You Cook email",
          text: `Your Let You Cook verification code is ${code}. It expires in 10 minutes.`,
        });
      } catch {
        throw new OperationalFailure("email_delivery_failure");
      }
    }

    return toChallengeResponse(challenge);
  };

  // Creates an unverified account, profile, and delivered challenge atomically.
  const register = async (input: SignUpInput) => {
    const passwordHash = await hashPassword(input.password);

    return database.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({ email: input.email, passwordHash })
        .returning({ id: users.id, email: users.email });

      await tx.insert(profiles).values({
        userId: user.id,
        displayName: input.displayName ?? input.email.split("@")[0],
      });

      return issueChallenge(tx, {
        recipient: user,
        normalizedEmail: user.email,
      });
    });
  };

  // Sends or reuses a generic challenge without revealing account existence.
  const request = async (normalizedEmail: string) =>
    database.transaction(async (tx) => {
      const [user] = await tx
        .select({
          id: users.id,
          email: users.email,
          emailVerifiedAt: users.emailVerifiedAt,
        })
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);

      return issueChallenge(tx, {
        recipient:
          user && !user.emailVerifiedAt
            ? { id: user.id, email: user.email }
            : null,
        normalizedEmail,
      });
    });

  // Consumes a valid challenge and creates the account's first full session.
  const confirm = async (
    challengeId: string,
    code: string,
  ): Promise<ConfirmationResult> =>
    database.transaction(async (tx) => {
      const verifiedAt = now();
      const [challenge] = await tx
        .select()
        .from(authChallenges)
        .where(
          and(
            eq(authChallenges.id, challengeId),
            eq(authChallenges.purpose, EMAIL_VERIFICATION_PURPOSE),
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
        return { ok: false };
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
        return { ok: false };
      }

      const [user] = await tx
        .update(users)
        .set({ emailVerifiedAt: verifiedAt, updatedAt: verifiedAt })
        .where(eq(users.id, challenge.userId))
        .returning({ id: users.id, email: users.email });

      if (!user) {
        return { ok: false };
      }

      await tx
        .update(authChallenges)
        .set({ consumedAt: verifiedAt })
        .where(eq(authChallenges.id, challenge.id));

      const refreshToken = createRefreshToken();
      await tx.insert(refreshTokens).values({
        userId: user.id,
        tokenHash: hashRefreshToken(refreshToken),
        expiresAt: refreshTokenExpiry(),
      });
      const accessToken = await createAccessToken(user.id);

      return {
        ok: true,
        session: authSessionResponseSchema.parse({
          user,
          tokens: { accessToken, refreshToken },
        }),
      };
    });

  return { register, request, confirm };
};
