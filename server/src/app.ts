import { Hono } from "hono";

import type { AuthRateLimitOptions } from "./auth/rateLimit";
import type { AuthConcurrencyHooks } from "./auth/concurrencyHooks";
import { healthResponseSchema } from "./contracts/system";
import { db } from "./db/client";
import {
  createSmtpEmailSenderFromEnv,
  type EmailSender,
} from "./email/emailSender";
import { handleAppError, handleNotFound } from "./http/errors";
import { requestIdMiddleware, type RequestIdEnv } from "./http/requestId";
import {
  consoleOperationalLogger,
  noopOperationalLogger,
  writeOperationalFailure,
  type OperationalLogger,
} from "./observability/operationalLogger";
import { blockRoutes } from "./routes/blocks";
import { favouriteRoutes } from "./routes/favourites";
import { imageRoutes } from "./routes/images";
import { recipeRoutes } from "./routes/recipes";
import { reportRoutes } from "./routes/reports";
import { createV1Routes } from "./routes/v1";

interface AppDependencies {
  emailSender?: EmailSender;
  authRateLimit?: AuthRateLimitOptions;
  logger?: OperationalLogger;
  database?: typeof db;
  authConcurrency?: AuthConcurrencyHooks;
}

// Creates the server application with injectable external delivery boundaries.
export const createApp = ({
  emailSender = createSmtpEmailSenderFromEnv(),
  authRateLimit,
  logger = noopOperationalLogger,
  database = db,
  authConcurrency,
}: AppDependencies = {}) => {
  const nextApp = new Hono<RequestIdEnv>()
    .use("*", requestIdMiddleware)
    .get("/health", (c) => c.json(healthResponseSchema.parse({ ok: true }), 200))
    .route(
      "/v1",
      createV1Routes(
        emailSender,
        { ...authRateLimit, logger },
        database,
        authConcurrency,
      ),
    )
    .route("/recipes", recipeRoutes)
    .route("/images", imageRoutes)
    .route("/favourites", favouriteRoutes)
    .route("/reports", reportRoutes)
    .route("/blocks", blockRoutes);

  nextApp.notFound(handleNotFound);
  nextApp.onError((error, context) => {
    writeOperationalFailure(logger, context, error);
    return handleAppError(error, context);
  });
  return nextApp;
};

export const app = createApp({ logger: consoleOperationalLogger });

export type AppType = typeof app;
