import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authenticate, optionalAuth } from "../../middleware/auth";
import * as commentController from "./comment.controller";
import * as commentLikeController from "./comment-like.controller";

const router = Router();

router.get("/updates/:updateId/comments", optionalAuth, asyncHandler(commentController.list));
router.post("/updates/:updateId/comments", authenticate, asyncHandler(commentController.create));
router.delete("/comments/:id", authenticate, asyncHandler(commentController.remove));
router.post("/comments/:id/like", authenticate, asyncHandler(commentLikeController.like));
router.delete("/comments/:id/like", authenticate, asyncHandler(commentLikeController.unlike));

export default router;
