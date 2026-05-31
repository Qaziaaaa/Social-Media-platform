import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authenticate, optionalAuth } from "../../middleware/auth";
import * as userController from "./user.controller";

const router = Router();

router.get("/", asyncHandler(userController.listUsers));
router.get("/suggestions", authenticate, asyncHandler(userController.suggestUsers));
router.get("/:id", optionalAuth, asyncHandler(userController.getUser));
router.get("/:id/posts", asyncHandler(userController.getUserPosts));
router.get("/:id/liked-posts", optionalAuth, asyncHandler(userController.getUserLikedPosts));
router.get("/:id/media-posts", asyncHandler(userController.getUserMediaPosts));
router.patch("/:id", authenticate, asyncHandler(userController.updateUser));

export default router;
