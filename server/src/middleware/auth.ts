import type { MiddlewareHandler } from "hono";
import { and, eq } from "drizzle-orm";

import { verifyAccessToken } from "../auth/tokens";
import { db } from "../db/client";
import { users } from "../db/schema";
import { errorResponse } from "../http/errors";
import type { RequestIdVariables } from "../http/requestId";

export interface AuthVariables extends RequestIdVariables {
  userId: string;
}

// Requires a valid bearer token and exposes its user identifier.
export const requireAuth: MiddlewareHandler<{ Variables: AuthVariables }> = async (c, next) => {
  const header = c.req.header("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

  if (!token) {
    return errorResponse(c, "authentication_required");
  }

  try {
    const userId = await verifyAccessToken(token);
    const [activeUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, userId), eq(users.accountStatus, "active")))
      .limit(1);

    if (!activeUser) {
      return errorResponse(c, "invalid_access_token");
    }

    c.set("userId", activeUser.id);
  } catch {
    return errorResponse(c, "invalid_access_token");
  }

  return next();
};
