import { Hono } from "hono";

import { errorResponse } from "../http/errors";
import type { RequestIdEnv } from "../http/requestId";

export const recipeRoutes = new Hono<RequestIdEnv>()
  .get("/", (c) => c.json({ recipes: [] }, 200))
  .get("/:id", (c) => errorResponse(c, "not_implemented"))
  .post("/", (c) => errorResponse(c, "not_implemented"));
