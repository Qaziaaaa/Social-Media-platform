import type { Request, Response } from "express";
import * as blockService from "./block.service";
import { success } from "../../types/responses";

export async function block(req: Request, res: Response) {
  const result = await blockService.blockUser(req.user!.userId, req.params.id as string);
  res.json(success(result));
}

export async function unblock(req: Request, res: Response) {
  const result = await blockService.unblockUser(req.user!.userId, req.params.id as string);
  res.json(success(result));
}

export async function listBlocked(req: Request, res: Response) {
  const result = await blockService.getBlockedUsers(req.user!.userId);
  res.json(success(result));
}

export async function checkBlocked(req: Request, res: Response) {
  const result = await blockService.isBlocked(req.user!.userId, req.params.id as string);
  res.json(success(result));
}
