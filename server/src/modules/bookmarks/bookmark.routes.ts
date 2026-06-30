import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authenticate } from "../../middleware/auth";
import * as bookmarkController from "./bookmark.controller";

const router = Router();

router.get("/", authenticate, asyncHandler(bookmarkController.list));
router.post("/updates/:updateId/bookmark", authenticate, asyncHandler(bookmarkController.bookmark));
router.delete("/updates/:updateId/bookmark", authenticate, asyncHandler(bookmarkController.unbookmark));

export default router;
