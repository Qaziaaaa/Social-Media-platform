import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authenticate } from "../../middleware/auth";
import * as milestoneController from "./milestone.controller";

const router = Router();

router.get("/me", authenticate, asyncHandler(milestoneController.listMy));
router.get("/project/:projectId", asyncHandler(milestoneController.listByProject));
router.get("/:id", asyncHandler(milestoneController.getById));
router.post("/", authenticate, asyncHandler(milestoneController.create));
router.patch("/:id", authenticate, asyncHandler(milestoneController.update));
router.delete("/:id", authenticate, asyncHandler(milestoneController.remove));

export default router;
