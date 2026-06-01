import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authenticate } from "../../middleware/auth";
import * as messageController from "./message.controller";

const router = Router();

router.get("/conversations", authenticate, asyncHandler(messageController.listConversations));
router.post("/conversations", authenticate, asyncHandler(messageController.createConversation));
router.get("/conversations/:id", authenticate, asyncHandler(messageController.getConversation));
router.get("/conversations/:id/messages", authenticate, asyncHandler(messageController.getMessages));
router.post("/conversations/:id/messages", authenticate, asyncHandler(messageController.sendMessage));

export default router;
