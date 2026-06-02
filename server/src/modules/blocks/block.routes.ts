import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authenticate } from "../../middleware/auth";
import * as blockController from "./block.controller";

const router = Router();

router.post("/users/:id/block", authenticate, asyncHandler(blockController.block));
router.delete("/users/:id/block", authenticate, asyncHandler(blockController.unblock));
router.get("/users/:id/block", authenticate, asyncHandler(blockController.checkBlocked));
router.get("/users/me/blocked", authenticate, asyncHandler(blockController.listBlocked));

export default router;
