import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authenticate } from "../../middleware/auth";
import * as likeController from "./like.controller";

const router = Router();

router.post("/posts/:postId/like", authenticate, asyncHandler(likeController.like));
router.delete("/posts/:postId/like", authenticate, asyncHandler(likeController.unlike));

export default router;
