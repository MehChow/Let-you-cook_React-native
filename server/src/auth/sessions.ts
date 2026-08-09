import { randomUUID } from "node:crypto";

import { and, eq, isNull } from "drizzle-orm";

import { verifyPassword } from "./password";
import {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
  refreshTokenExpiry,
} from "./tokens";
import {
  authSessionResponseSchema,
  authTokensSchema,
  logoutResponseSchema,
  type AuthCredentials,
} from "../contracts/auth";
import { db } from "../db/client";
import { refreshTokens, users } from "../db/schema";

type AuthTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type TokenDatabase = typeof db | AuthTransaction;

interface AuthSessionServiceOptions {
  database?: typeof db;
  afterRefreshLookup?(): Promise<void>;
}

// Creates and persists one internal access/refresh token pair.
const createTokenPair = async (
  database: TokenDatabase,
  userId: string,
  familyId: string = randomUUID(),
) => {
  const refreshToken = createRefreshToken();
  const [row] = await database
    .insert(refreshTokens)
    .values({
      userId,
      familyId,
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

// Projects internal token metadata into the strict public token DTO.
const toAuthTokens = (
  tokens: Awaited<ReturnType<typeof createTokenPair>>,
) =>
  authTokensSchema.parse({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });

// Builds login, refresh, and logout operations around injected persistence.
export const createAuthSessionService = ({
  database = db,
  afterRefreshLookup,
}: AuthSessionServiceOptions = {}) => {
  // Authenticates one active verified account and creates a new session.
  const login = async (credentials: AuthCredentials) => {
    const [user] = await database
      .select({
        id: users.id,
        email: users.email,
        passwordHash: users.passwordHash,
        emailVerifiedAt: users.emailVerifiedAt,
        accountStatus: users.accountStatus,
      })
      .from(users)
      .where(eq(users.email, credentials.email))
      .limit(1);

    if (
      !user ||
      user.accountStatus !== "active" ||
      !(await verifyPassword(credentials.password, user.passwordHash))
    ) {
      return { ok: false, error: "invalid_credentials" } as const;
    }

    if (!user.emailVerifiedAt) {
      return { ok: false, error: "email_verification_required" } as const;
    }

    const tokens = await createTokenPair(database, user.id);
    return {
      ok: true,
      session: authSessionResponseSchema.parse({
        user: { id: user.id, email: user.email },
        tokens: toAuthTokens(tokens),
      }),
    } as const;
  };

  // Serializes rotation and revokes only the compromised token family.
  const refresh = async (rawRefreshToken: string) => {
    const tokenHash = hashRefreshToken(rawRefreshToken);
    const [currentToken] = await database
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .limit(1);

    await afterRefreshLookup?.();

    if (!currentToken) {
      return { ok: false, error: "invalid_refresh_token" } as const;
    }

    return database.transaction(async (tx) => {
      const rotatedAt = new Date();
      const [account] = await tx
        .select({ accountStatus: users.accountStatus })
        .from(users)
        .where(eq(users.id, currentToken.userId))
        .limit(1)
        .for("update");
      const [lockedToken] = await tx
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.id, currentToken.id))
        .limit(1)
        .for("update");

      if (!account || account.accountStatus !== "active" || lockedToken?.revokedAt) {
        await tx
          .update(refreshTokens)
          .set({ revokedAt: rotatedAt })
          .where(
            and(
              eq(refreshTokens.userId, currentToken.userId),
              eq(refreshTokens.familyId, currentToken.familyId),
              isNull(refreshTokens.revokedAt),
            ),
          );
        return {
          ok: false,
          error: "refresh_token_reuse_detected",
        } as const;
      }

      if (!lockedToken || lockedToken.expiresAt <= rotatedAt) {
        return { ok: false, error: "refresh_token_expired" } as const;
      }

      const tokens = await createTokenPair(
        tx,
        currentToken.userId,
        lockedToken.familyId,
      );
      await tx
        .update(refreshTokens)
        .set({
          usedAt: rotatedAt,
          revokedAt: rotatedAt,
          replacedByTokenId: tokens.refreshTokenId,
        })
        .where(eq(refreshTokens.id, currentToken.id));

      return { ok: true, tokens: toAuthTokens(tokens) } as const;
    });
  };

  // Revokes the presented refresh token without revealing whether it exists.
  const logout = async (rawRefreshToken: string) => {
    await database
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.tokenHash, hashRefreshToken(rawRefreshToken)));
    return logoutResponseSchema.parse({ ok: true });
  };

  return { login, refresh, logout };
};
