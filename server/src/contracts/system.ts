import { z } from "zod";

export const healthResponseSchema = z.strictObject({
  ok: z.literal(true),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
