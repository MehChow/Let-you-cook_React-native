import { Hono } from "hono";

import { deleteAccount } from "../auth/accountDeletion";
import { logoutResponseSchema } from "../contracts/auth";
import { errorResponse } from "../http/errors";
import { requireAuth, type AuthVariables } from "../middleware/auth";

export const userRoutes = new Hono<{ Variables: AuthVariables }>()
  .use("*", requireAuth)
  .delete("/me", async (c) => {
    const deleted = await deleteAccount(c.get("userId"));
    return deleted
      ? c.json(logoutResponseSchema.parse({ ok: true }), 200)
      : errorResponse(c, "invalid_access_token");
  });
