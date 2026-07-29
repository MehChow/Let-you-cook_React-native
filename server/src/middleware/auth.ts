import type { MiddlewareHandler } from "hono";

import { verifyAccessToken } from "../auth/tokens";
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
    c.set("userId", await verifyAccessToken(token));
  } catch {
    return errorResponse(c, "invalid_access_token");
  }

  return next();
};
