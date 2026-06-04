import { z } from "zod";

export const createStorySchema = z.object({
  mediaUrl: z.string().min(1, "Media URL is required"),
});
