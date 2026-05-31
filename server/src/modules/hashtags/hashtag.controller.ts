import type { Request, Response } from "express";
import * as hashtagService from "./hashtag.service";
import { success } from "../../types/responses";

export async function getPosts(req: Request, res: Response) {
  const tag = req.params.tag as string;
  const cursor = req.query.cursor as string | undefined;
  const limit = Number(req.query.limit) || 20;
  const result = await hashtagService.getPostsByHashtag(tag, cursor, limit);
  res.json(success(result));
}

export async function trending(req: Request, res: Response) {
  const limit = Number(req.query.limit) || 10;
  const result = await hashtagService.getTrendingHashtags(limit);
  res.json(success(result));
}
