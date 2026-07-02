import { Hono } from "hono";

import { authRoutes } from "./routes/auth";
import { blockRoutes } from "./routes/blocks";
import { favouriteRoutes } from "./routes/favourites";
import { imageRoutes } from "./routes/images";
import { profileRoutes } from "./routes/profiles";
import { recipeRoutes } from "./routes/recipes";
import { reportRoutes } from "./routes/reports";

export const app = new Hono()
  .get("/health", (c) => c.json({ ok: true }, 200))
  .route("/auth", authRoutes)
  .route("/profiles", profileRoutes)
  .route("/recipes", recipeRoutes)
  .route("/images", imageRoutes)
  .route("/favourites", favouriteRoutes)
  .route("/reports", reportRoutes)
  .route("/blocks", blockRoutes);

export type AppType = typeof app;
