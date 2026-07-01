import { z } from "zod";

export const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  fullName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  skills: z.array(z.string().max(50)).max(20).optional(),
  website: z.string().url().max(200).optional(),
  location: z.string().max(100).optional(),
});
