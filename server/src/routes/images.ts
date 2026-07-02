import { Hono } from "hono";

export const imageRoutes = new Hono().post("/upload-url", (c) =>
  c.json({ message: "Image upload URLs need Cloudflare R2 credentials" }, 501),
);
