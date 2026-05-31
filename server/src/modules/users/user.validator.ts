import { z } from "zod";

export const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  fullName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
});
