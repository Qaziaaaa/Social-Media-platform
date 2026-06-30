import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authenticate, optionalAuth } from "../../middleware/auth";
import * as userController from "./user.controller";

const router = Router();

router.get("/", asyncHandler(userController.listUsers));
router.get("/suggestions", authenticate, asyncHandler(userController.suggestUsers));
router.get("/:id", optionalAuth, asyncHandler(userController.getUser));
router.get("/:id/updates", asyncHandler(userController.getUserUpdates));
router.get("/:id/liked-updates", optionalAuth, asyncHandler(userController.getUserLikedUpdates));
router.get("/:id/media-updates", asyncHandler(userController.getUserMediaUpdates));
router.patch("/:id", authenticate, asyncHandler(userController.updateUser));

export default router;
