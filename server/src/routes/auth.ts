import { zValidator } from "@hono/zod-validator";
import { and, eq, gt, isNull } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { hashPassword, verifyPassword } from "../auth/password";
import {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
  refreshTokenExpiry,
} from "../auth/tokens";
import { db } from "../db/client";
import { profiles, refreshTokens, users } from "../db/schema";

const authBodySchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()),
  password: z.string().min(8),
});

const signupBodySchema = authBodySchema.extend({
  displayName: z.string().min(1).max(80).optional(),
});

const refreshBodySchema = z.object({
  refreshToken: z.string().min(1),
});

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

export const authRoutes = new Hono()
  .post("/signup", zValidator("json", signupBodySchema), async (c) => {
    const body = c.req.valid("json");
    const passwordHash = await hashPassword(body.password);

    try {
      const [user] = await db
        .insert(users)
        .values({ email: body.email, passwordHash })
        .returning({ id: users.id, email: users.email });

      await db.insert(profiles).values({
        userId: user.id,
        displayName: body.displayName ?? body.email.split("@")[0],
      });

      const tokens = await createTokenPair(user.id);

      return c.json({ user, tokens }, 201);
    } catch {
      return c.json({ message: "Email is already registered" }, 409);
    }
  })
  .post("/login", zValidator("json", authBodySchema), async (c) => {
    const body = c.req.valid("json");
    const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1);

    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return c.json({ message: "Invalid email or password" }, 401);
    }

    const tokens = await createTokenPair(user.id);

    return c.json({ user: { id: user.id, email: user.email }, tokens }, 200);
  })
  .post("/refresh", zValidator("json", refreshBodySchema), async (c) => {
    const tokenHash = hashRefreshToken(c.req.valid("json").refreshToken);
    const [currentToken] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .limit(1);

    if (!currentToken) {
      return c.json({ message: "Invalid refresh token" }, 401);
    }

    if (currentToken.revokedAt) {
      await db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(and(eq(refreshTokens.userId, currentToken.userId), isNull(refreshTokens.revokedAt)));
      return c.json({ message: "Refresh token was reused" }, 403);
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
      return c.json({ message: "Refresh token expired" }, 401);
    }

    const tokens = await createTokenPair(currentToken.userId);
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date(), replacedByTokenId: tokens.refreshTokenId })
      .where(eq(refreshTokens.id, currentToken.id));

    return c.json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }, 200);
  })
  .post("/logout", zValidator("json", refreshBodySchema), async (c) => {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.tokenHash, hashRefreshToken(c.req.valid("json").refreshToken)));

    return c.json({ ok: true }, 200);
  });
