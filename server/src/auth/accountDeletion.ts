import { randomUUID } from "node:crypto";

import { and, eq, inArray, isNull, ne, or } from "drizzle-orm";

import { db } from "../db/client";
import {
  authChallenges,
  blocks,
  favourites,
  profiles,
  recipeImages,
  recipes,
  refreshTokens,
  users,
} from "../db/schema";

// Irreversibly tombstones one active account and erases private auth data.
export const deleteAccount = async (
  userId: string,
  now: Date = new Date(),
  afterUserLock?: () => Promise<void>,
): Promise<boolean> =>
  db.transaction(async (tx) => {
    const [user] = await tx
      .select({ id: users.id, accountStatus: users.accountStatus })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .for("update");

    if (!user || user.accountStatus !== "active") {
      return false;
    }

    await afterUserLock?.();

    await tx
      .update(refreshTokens)
      .set({ revokedAt: now })
      .where(
        and(
          eq(refreshTokens.userId, userId),
          isNull(refreshTokens.revokedAt),
        ),
      );
    await tx.delete(authChallenges).where(eq(authChallenges.userId, userId));
    await tx.delete(favourites).where(eq(favourites.userId, userId));
    await tx
      .delete(blocks)
      .where(or(eq(blocks.blockerId, userId), eq(blocks.blockedId, userId)));
    await tx
      .delete(recipeImages)
      .where(
        and(
          eq(recipeImages.userId, userId),
          or(
            isNull(recipeImages.recipeId),
            inArray(
              recipeImages.recipeId,
              tx
                .select({ id: recipes.id })
                .from(recipes)
                .where(
                  and(eq(recipes.userId, userId), ne(recipes.status, "published")),
                ),
            ),
          ),
        ),
      );
    await tx.delete(profiles).where(eq(profiles.userId, userId));
    await tx
      .update(users)
      .set({
        email: `deleted:${userId}`,
        passwordHash: `deleted:${randomUUID()}`,
        emailVerifiedAt: null,
        accountStatus: "deleted",
        deletedAt: now,
        updatedAt: now,
      })
      .where(eq(users.id, userId));

    return true;
  });
