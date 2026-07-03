import { z } from "zod";

export const createMilestoneSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(["planned", "in_progress", "completed"]).optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateMilestoneSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(["planned", "in_progress", "completed"]).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});
