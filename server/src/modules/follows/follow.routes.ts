import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authenticate } from "../../middleware/auth";
import * as followController from "./follow.controller";

const router = Router();

router.post("/users/:id/follow", authenticate, asyncHandler(followController.follow));
router.delete("/users/:id/follow", authenticate, asyncHandler(followController.unfollow));

export default router;
