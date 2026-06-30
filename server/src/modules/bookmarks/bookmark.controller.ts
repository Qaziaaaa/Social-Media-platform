import type { Request, Response } from "express";
import * as bookmarkService from "./bookmark.service";
import { success } from "../../types/responses";

export async function bookmark(req: Request, res: Response) {
  const result = await bookmarkService.bookmarkUpdate(req.params.updateId as string, req.user!.userId);
  res.json(success(result));
}

export async function unbookmark(req: Request, res: Response) {
  const result = await bookmarkService.unbookmarkUpdate(req.params.updateId as string, req.user!.userId);
  res.json(success(result));
}

export async function list(req: Request, res: Response) {
  const cursor = req.query.cursor as string | undefined;
  const limit = Number(req.query.limit) || 20;
  const result = await bookmarkService.getUserBookmarks(req.user!.userId, cursor, limit);
  res.json(success(result));
}
