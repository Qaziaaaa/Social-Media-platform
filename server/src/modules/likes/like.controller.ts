import type { Request, Response } from "express";
import * as likeService from "./like.service";
import { success } from "../../types/responses";

export async function like(req: Request, res: Response) {
  const result = await likeService.likePost(req.params.postId as string, req.user!.userId);
  res.json(success(result));
}

export async function unlike(req: Request, res: Response) {
  const result = await likeService.unlikePost(req.params.postId as string, req.user!.userId);
  res.json(success(result));
}
