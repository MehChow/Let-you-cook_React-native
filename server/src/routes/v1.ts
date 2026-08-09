import { Hono } from "hono";

import type { AuthRateLimitOptions } from "../auth/rateLimit";
import type { AuthConcurrencyHooks } from "../auth/concurrencyHooks";
import { db } from "../db/client";
import type { EmailSender } from "../email/emailSender";
import { createAuthRoutes } from "./auth";
import { blockRoutes } from "./blocks";
import { favouriteRoutes } from "./favourites";
import { imageRoutes } from "./images";
import { profileRoutes } from "./profiles";
import { recipeRoutes } from "./recipes";
import { reportRoutes } from "./reports";
import { createUserRoutes } from "./users";

// Composes versioned routes around server-owned runtime dependencies.
export const createV1Routes = (
  emailSender: EmailSender,
  rateLimitOptions?: AuthRateLimitOptions,
  database: typeof db = db,
  concurrencyHooks: AuthConcurrencyHooks = {},
) =>
  new Hono()
    .route(
      "/auth",
      createAuthRoutes(
        emailSender,
        rateLimitOptions,
        database,
        concurrencyHooks,
      ),
    )
    .route("/users", createUserRoutes(concurrencyHooks))
    .route("/profiles", profileRoutes)
    .route("/recipes", recipeRoutes)
    .route("/images", imageRoutes)
    .route("/favourites", favouriteRoutes)
    .route("/reports", reportRoutes)
    .route("/blocks", blockRoutes);
