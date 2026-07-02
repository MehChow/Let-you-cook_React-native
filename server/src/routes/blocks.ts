import { Hono } from "hono";

export const blockRoutes = new Hono().post("/", (c) =>
  c.json({ message: "Blocks are not implemented yet" }, 501),
);
