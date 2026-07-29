import { Hono } from "hono";

import { errorResponse } from "../http/errors";
import type { RequestIdEnv } from "../http/requestId";

export const imageRoutes = new Hono<RequestIdEnv>().post(
  "/upload-url",
  (c) => errorResponse(c, "not_implemented"),
);
