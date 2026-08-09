import { Hono } from "hono";

import { healthResponseSchema } from "./contracts/system";
import { handleAppError, handleNotFound } from "./http/errors";
import { requestIdMiddleware, type RequestIdEnv } from "./http/requestId";
import { blockRoutes } from "./routes/blocks";
import { favouriteRoutes } from "./routes/favourites";
import { imageRoutes } from "./routes/images";
import { recipeRoutes } from "./routes/recipes";
import { reportRoutes } from "./routes/reports";
import { v1Routes } from "./routes/v1";

export const app = new Hono<RequestIdEnv>()
  .use("*", requestIdMiddleware)
  .get("/health", (c) => c.json(healthResponseSchema.parse({ ok: true }), 200))
  .route("/v1", v1Routes)
  .route("/recipes", recipeRoutes)
  .route("/images", imageRoutes)
  .route("/favourites", favouriteRoutes)
  .route("/reports", reportRoutes)
  .route("/blocks", blockRoutes);

app.notFound(handleNotFound);
app.onError(handleAppError);

export type AppType = typeof app;
