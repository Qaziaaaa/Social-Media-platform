import { z } from "zod";

export const createReportSchema = z.object({
  targetType: z.enum(["update", "comment", "user"]),
  targetId: z.string().min(1),
  reason: z.string().min(1).max(500),
});

export const updateReportStatusSchema = z.object({
  status: z.enum(["pending", "resolved", "dismissed"]),
});
