import { Hono } from "hono";

export const reportRoutes = new Hono().post("/", (c) =>
  c.json({ message: "Reports are not implemented yet" }, 501),
);
