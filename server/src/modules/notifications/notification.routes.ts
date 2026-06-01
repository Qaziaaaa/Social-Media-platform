import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authenticate } from "../../middleware/auth";
import * as notificationController from "./notification.controller";

const router = Router();

router.get("/", authenticate, asyncHandler(notificationController.list));
router.get("/unread-count", authenticate, asyncHandler(notificationController.unreadCount));
router.patch("/:id/read", authenticate, asyncHandler(notificationController.markRead));
router.patch("/read-all", authenticate, asyncHandler(notificationController.markAllRead));

export default router;
