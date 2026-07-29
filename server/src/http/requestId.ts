import { randomUUID } from "node:crypto";

import type { MiddlewareHandler } from "hono";

export const REQUEST_ID_HEADER = "X-Request-Id";

export interface RequestIdVariables {
  requestId: string;
}

export type RequestIdEnv = {
  Variables: RequestIdVariables;
};

// Assigns one server-owned correlation identifier to every response.
export const requestIdMiddleware: MiddlewareHandler<RequestIdEnv> = async (c, next) => {
  const requestId = randomUUID();
  c.set("requestId", requestId);
  c.header(REQUEST_ID_HEADER, requestId);
  await next();
};
