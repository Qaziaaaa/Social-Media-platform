import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authenticate } from "../../middleware/auth";
import * as bookmarkController from "./bookmark.controller";

const router = Router();

router.get("/", authenticate, asyncHandler(bookmarkController.list));
router.post("/posts/:postId/bookmark", authenticate, asyncHandler(bookmarkController.bookmark));
router.delete("/posts/:postId/bookmark", authenticate, asyncHandler(bookmarkController.unbookmark));

export default router;
