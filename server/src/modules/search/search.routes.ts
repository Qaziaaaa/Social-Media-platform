import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as searchController from "./search.controller";

const router = Router();

router.get("/", asyncHandler(searchController.search));

export default router;
