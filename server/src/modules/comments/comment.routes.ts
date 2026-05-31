import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authenticate } from "../../middleware/auth";
import * as commentController from "./comment.controller";

const router = Router();

router.get("/posts/:postId/comments", asyncHandler(commentController.list));
router.post("/posts/:postId/comments", authenticate, asyncHandler(commentController.create));
router.delete("/comments/:id", authenticate, asyncHandler(commentController.remove));

export default router;
