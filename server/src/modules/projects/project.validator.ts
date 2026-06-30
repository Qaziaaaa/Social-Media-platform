import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  category: z.string().max(100).optional(),
  techStack: z.array(z.string().max(50)).max(20).optional(),
  status: z.enum(["idea", "in_progress", "testing", "completed", "archived"]).optional(),
  visibility: z.enum(["public", "private"]).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  category: z.string().max(100).optional(),
  techStack: z.array(z.string().max(50)).max(20).optional(),
  status: z.enum(["idea", "in_progress", "testing", "completed", "archived"]).optional(),
  visibility: z.enum(["public", "private"]).optional(),
});
