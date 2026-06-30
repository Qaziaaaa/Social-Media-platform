import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as hashtagController from "./hashtag.controller";

const router = Router();

router.get("/trending", asyncHandler(hashtagController.trending));
router.get("/:tag/updates", asyncHandler(hashtagController.getUpdates));

export default router;
