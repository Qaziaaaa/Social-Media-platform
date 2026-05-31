import type { Request, Response } from "express";
import { createPostSchema, updatePostSchema } from "./post.validator";
import * as postService from "./post.service";
import { success } from "../../types/responses";

export async function create(req: Request, res: Response) {
  const data = createPostSchema.parse(req.body);
  const post = await postService.createPost(req.user!.userId, data.content, data.imageUrl);
  res.status(201).json(success(post));
}

export async function getById(req: Request, res: Response) {
  const post = await postService.getPostById(req.params.id as string, req.user?.userId);
  res.json(success(post));
}

export async function update(req: Request, res: Response) {
  const data = updatePostSchema.parse(req.body);
  const post = await postService.updatePost(req.params.id as string, req.user!.userId, data);
  res.json(success(post));
}

export async function repost(req: Request, res: Response) {
  const post = await postService.repostPost(req.params.id as string, req.user!.userId);
  res.status(201).json(success(post));
}

export async function remove(req: Request, res: Response) {
  await postService.deletePost(req.params.id as string, req.user!.userId);
  res.json(success({ message: "Post deleted" }));
}

export async function feed(req: Request, res: Response) {
  const cursor = req.query.cursor as string | undefined;
  const limit = Number(req.query.limit) || 20;
  const result = await postService.getFeed(cursor, limit, req.user?.userId);
  res.json(success(result));
}
