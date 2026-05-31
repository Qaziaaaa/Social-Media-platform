import type { Request, Response } from "express";
import * as followService from "./follow.service";
import { success } from "../../types/responses";

export async function follow(req: Request, res: Response) {
  const result = await followService.followUser(req.user!.userId, req.params.id as string);
  res.json(success(result));
}

export async function unfollow(req: Request, res: Response) {
  const result = await followService.unfollowUser(req.user!.userId, req.params.id as string);
  res.json(success(result));
}
