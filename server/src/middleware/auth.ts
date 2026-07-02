import type { MiddlewareHandler } from "hono";

import { verifyAccessToken } from "../auth/tokens";

export interface AuthVariables {
  userId: string;
}

export const requireAuth: MiddlewareHandler<{ Variables: AuthVariables }> = async (c, next) => {
  const header = c.req.header("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

  if (!token) {
    return c.json({ message: "Missing bearer token" }, 401);
  }

  try {
    c.set("userId", await verifyAccessToken(token));
  } catch {
    return c.json({ message: "Invalid bearer token" }, 401);
  }

  return next();
};
