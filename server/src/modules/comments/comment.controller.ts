import type { Request, Response } from "express";
import { createCommentSchema } from "./comment.validator";
import * as commentService from "./comment.service";
import { success } from "../../types/responses";

export async function create(req: Request, res: Response) {
  const data = createCommentSchema.parse(req.body);
  const comment = await commentService.createComment(req.params.postId as string, req.user!.userId, data.content, data.parentId);
  res.status(201).json(success(comment));
}

export async function list(req: Request, res: Response) {
  const cursor = req.query.cursor as string | undefined;
  const limit = Number(req.query.limit) || 20;
  const result = await commentService.getComments(req.params.postId as string, cursor, limit, req.user?.userId);
  res.json(success(result));
}

export async function remove(req: Request, res: Response) {
  await commentService.deleteComment(req.params.id as string, req.user!.userId);
  res.json(success({ message: "Comment deleted" }));
}
