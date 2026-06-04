import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authenticate } from "../../middleware/auth";
import * as storyController from "./story.controller";

const router = Router();

router.post("/", authenticate, asyncHandler(storyController.create));
router.get("/following", authenticate, asyncHandler(storyController.getFollowing));
router.get("/user/:userId", authenticate, asyncHandler(storyController.getByUser));
router.delete("/:id", authenticate, asyncHandler(storyController.remove));

export default router;
