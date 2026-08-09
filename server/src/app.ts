import { Hono } from "hono";

import { healthResponseSchema } from "./contracts/system";
import {
  createSmtpEmailSenderFromEnv,
  type EmailSender,
} from "./email/emailSender";
import { handleAppError, handleNotFound } from "./http/errors";
import { requestIdMiddleware, type RequestIdEnv } from "./http/requestId";
import { blockRoutes } from "./routes/blocks";
import { favouriteRoutes } from "./routes/favourites";
import { imageRoutes } from "./routes/images";
import { recipeRoutes } from "./routes/recipes";
import { reportRoutes } from "./routes/reports";
import { createV1Routes } from "./routes/v1";

interface AppDependencies {
  emailSender?: EmailSender;
}

// Creates the server application with injectable external delivery boundaries.
export const createApp = ({
  emailSender = createSmtpEmailSenderFromEnv(),
}: AppDependencies = {}) => {
  const nextApp = new Hono<RequestIdEnv>()
    .use("*", requestIdMiddleware)
    .get("/health", (c) => c.json(healthResponseSchema.parse({ ok: true }), 200))
    .route("/v1", createV1Routes(emailSender))
    .route("/recipes", recipeRoutes)
    .route("/images", imageRoutes)
    .route("/favourites", favouriteRoutes)
    .route("/reports", reportRoutes)
    .route("/blocks", blockRoutes);

  nextApp.notFound(handleNotFound);
  nextApp.onError(handleAppError);
  return nextApp;
};

export const app = createApp();

export type AppType = typeof app;
