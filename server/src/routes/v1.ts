import { Hono } from "hono";

import type { EmailSender } from "../email/emailSender";
import { createAuthRoutes } from "./auth";
import { blockRoutes } from "./blocks";
import { favouriteRoutes } from "./favourites";
import { imageRoutes } from "./images";
import { profileRoutes } from "./profiles";
import { recipeRoutes } from "./recipes";
import { reportRoutes } from "./reports";
import { userRoutes } from "./users";

// Composes versioned routes around server-owned runtime dependencies.
export const createV1Routes = (emailSender: EmailSender) =>
  new Hono()
    .route("/auth", createAuthRoutes(emailSender))
    .route("/users", userRoutes)
    .route("/profiles", profileRoutes)
    .route("/recipes", recipeRoutes)
    .route("/images", imageRoutes)
    .route("/favourites", favouriteRoutes)
    .route("/reports", reportRoutes)
    .route("/blocks", blockRoutes);
