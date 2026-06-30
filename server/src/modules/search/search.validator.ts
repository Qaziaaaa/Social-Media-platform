import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  type: z.enum(["users", "updates", "all"]).default("all"),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});
