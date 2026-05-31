import type { Request, Response } from "express";
import * as commentLikeService from "./comment-like.service";
import { success } from "../../types/responses";

export async function like(req: Request, res: Response) {
  const result = await commentLikeService.likeComment(req.params.id as string, req.user!.userId);
  res.json(success(result));
}

export async function unlike(req: Request, res: Response) {
  const result = await commentLikeService.unlikeComment(req.params.id as string, req.user!.userId);
  res.json(success(result));
}
