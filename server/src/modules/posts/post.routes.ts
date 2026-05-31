import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authenticate, optionalAuth } from "../../middleware/auth";
import * as postController from "./post.controller";

const router = Router();

router.get("/", optionalAuth, asyncHandler(postController.feed));
router.get("/:id", asyncHandler(postController.getById));
router.post("/", authenticate, asyncHandler(postController.create));
router.patch("/:id", authenticate, asyncHandler(postController.update));
router.delete("/:id", authenticate, asyncHandler(postController.remove));

export default router;
