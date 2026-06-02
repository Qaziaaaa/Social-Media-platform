import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authenticate } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/admin";
import { validate } from "../../middleware/validate";
import * as reportController from "./report.controller";
import { createReportSchema, updateReportStatusSchema } from "./report.validator";

const router = Router();

router.post("/reports", authenticate, validate(createReportSchema), asyncHandler(reportController.create));
router.get("/admin/reports", authenticate, requireAdmin, asyncHandler(reportController.list));
router.patch("/admin/reports/:id", authenticate, requireAdmin, validate(updateReportStatusSchema), asyncHandler(reportController.updateStatus));

export default router;
