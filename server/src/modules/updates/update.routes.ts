import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authenticate, optionalAuth } from "../../middleware/auth";
import * as updateController from "./update.controller";

const router = Router();

router.get("/", optionalAuth, asyncHandler(updateController.feed));
router.get("/:id", optionalAuth, asyncHandler(updateController.getById));
router.post("/", authenticate, asyncHandler(updateController.create));
router.patch("/:id", authenticate, asyncHandler(updateController.update));
router.delete("/:id", authenticate, asyncHandler(updateController.remove));

export default router;
