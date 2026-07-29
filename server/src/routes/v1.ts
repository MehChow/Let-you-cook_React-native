import { Hono } from "hono";

import { authRoutes } from "./auth";
import { blockRoutes } from "./blocks";
import { favouriteRoutes } from "./favourites";
import { imageRoutes } from "./images";
import { profileRoutes } from "./profiles";
import { recipeRoutes } from "./recipes";
import { reportRoutes } from "./reports";

export const v1Routes = new Hono()
  .route("/auth", authRoutes)
  .route("/profiles", profileRoutes)
  .route("/recipes", recipeRoutes)
  .route("/images", imageRoutes)
  .route("/favourites", favouriteRoutes)
  .route("/reports", reportRoutes)
  .route("/blocks", blockRoutes);
