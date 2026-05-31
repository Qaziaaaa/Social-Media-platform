import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authenticate, optionalAuth } from "../../middleware/auth";
import * as userController from "./user.controller";

const router = Router();

router.get("/", asyncHandler(userController.listUsers));
router.get("/:id", optionalAuth, asyncHandler(userController.getUser));
router.get("/:id/posts", asyncHandler(userController.getUserPosts));
router.patch("/:id", authenticate, asyncHandler(userController.updateUser));

export default router;
