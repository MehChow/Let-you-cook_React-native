import { Hono } from "hono";

export const favouriteRoutes = new Hono().get("/", (c) => c.json({ favourites: [] }, 200));
