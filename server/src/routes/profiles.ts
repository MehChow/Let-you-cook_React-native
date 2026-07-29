import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "../db/client";
import { profiles, users } from "../db/schema";
import { errorResponse, validationErrorHook } from "../http/errors";
import { requireAuth, type AuthVariables } from "../middleware/auth";

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(80).optional(),
  bio: z.string().max(500).nullable().optional(),
  avatarImageUrl: z.url().nullable().optional(),
});

export const profileRoutes = new Hono<{ Variables: AuthVariables }>()
  .use("*", requireAuth)
  .get("/me", async (c) => {
    const userId = c.get("userId");
    const [profile] = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: profiles.displayName,
        bio: profiles.bio,
        avatarImageUrl: profiles.avatarImageUrl,
      })
      .from(users)
      .innerJoin(profiles, eq(profiles.userId, users.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (!profile) {
      return errorResponse(c, "resource_not_found");
    }

    return c.json({ profile }, 200);
  })
  .patch(
    "/me",
    zValidator("json", updateProfileSchema, validationErrorHook),
    async (c) => {
      const [profile] = await db
        .update(profiles)
        .set({ ...c.req.valid("json"), updatedAt: new Date() })
        .where(eq(profiles.userId, c.get("userId")))
        .returning({
          displayName: profiles.displayName,
          bio: profiles.bio,
          avatarImageUrl: profiles.avatarImageUrl,
        });

      return c.json({ profile }, 200);
    },
  );
