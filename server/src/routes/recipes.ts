import { Hono } from "hono";

export const recipeRoutes = new Hono()
  .get("/", (c) => c.json({ recipes: [] }, 200))
  .get("/:id", (c) => c.json({ message: "Recipe endpoint is not implemented yet" }, 501))
  .post("/", (c) => c.json({ message: "Recipe creation is not implemented yet" }, 501));
