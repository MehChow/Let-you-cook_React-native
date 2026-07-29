import { Hono } from "hono";

import { errorResponse } from "../http/errors";
import type { RequestIdEnv } from "../http/requestId";

export const blockRoutes = new Hono<RequestIdEnv>().post("/", (c) =>
  errorResponse(c, "not_implemented"),
);
