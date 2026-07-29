import { Hono } from "hono";

import { requestIdMiddleware, type RequestIdEnv } from "./http/requestId";
import { authRoutes } from "./routes/auth";
import { blockRoutes } from "./routes/blocks";
import { favouriteRoutes } from "./routes/favourites";
import { imageRoutes } from "./routes/images";
import { profileRoutes } from "./routes/profiles";
import { recipeRoutes } from "./routes/recipes";
import { reportRoutes } from "./routes/reports";
import { v1Routes } from "./routes/v1";

export const app = new Hono<RequestIdEnv>()
  .use("*", requestIdMiddleware)
  .get("/health", (c) => c.json({ ok: true }, 200))
  .route("/v1", v1Routes)
  .route("/auth", authRoutes)
  .route("/profiles", profileRoutes)
  .route("/recipes", recipeRoutes)
  .route("/images", imageRoutes)
  .route("/favourites", favouriteRoutes)
  .route("/reports", reportRoutes)
  .route("/blocks", blockRoutes);

export type AppType = typeof app;
