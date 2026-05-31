import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authenticate } from "../../middleware/auth";
import { upload } from "./upload.config";
import * as uploadController from "./upload.controller";

const router = Router();

router.post("/", authenticate, upload.single("file"), asyncHandler(uploadController.uploadFile));

export default router;
