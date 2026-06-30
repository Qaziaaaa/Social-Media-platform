import { z } from "zod";

export const createUpdateSchema = z.object({
  content: z.string().max(5000).default(""),
  imageUrl: z.string().optional(),
}).refine((data) => data.content || data.imageUrl, {
  message: "Update must have content or an image",
});

export const updateUpdateSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  imageUrl: z.string().optional(),
});
