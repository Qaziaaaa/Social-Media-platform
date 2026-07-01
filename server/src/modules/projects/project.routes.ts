import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authenticate } from "../../middleware/auth";
import * as projectController from "./project.controller";

const router = Router();

router.get("/", authenticate, asyncHandler(projectController.list));
router.get("/user/:userId", asyncHandler(projectController.listByUser));
router.get("/:id", asyncHandler(projectController.getById));
router.post("/", authenticate, asyncHandler(projectController.create));
router.patch("/:id", authenticate, asyncHandler(projectController.update));
router.delete("/:id", authenticate, asyncHandler(projectController.remove));

export default router;
