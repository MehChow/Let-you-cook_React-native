import { Hono } from "hono";

import { deleteAccount } from "../auth/accountDeletion";
import type { AuthConcurrencyHooks } from "../auth/concurrencyHooks";
import { logoutResponseSchema } from "../contracts/auth";
import { errorResponse } from "../http/errors";
import { requireAuth, type AuthVariables } from "../middleware/auth";

// Creates current-user routes around optional deterministic concurrency hooks.
export const createUserRoutes = (
  concurrencyHooks: AuthConcurrencyHooks = {},
) => new Hono<{ Variables: AuthVariables }>()
  .use("*", requireAuth)
  .delete("/me", async (c) => {
    const deleted = await deleteAccount(
      c.get("userId"),
      new Date(),
      concurrencyHooks.afterAccountDeletionLock,
    );
    return deleted
      ? c.json(logoutResponseSchema.parse({ ok: true }), 200)
      : errorResponse(c, "invalid_access_token");
  });
