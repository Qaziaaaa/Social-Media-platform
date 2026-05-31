import type { Request, Response } from "express";
import { updateProfileSchema } from "./user.validator";
import * as userService from "./user.service";
import { success } from "../../types/responses";
import { AppError } from "../../middleware/errorHandler";

export async function getUser(req: Request, res: Response) {
  const user = await userService.getUserById(req.params.id as string, req.user?.userId);
  res.json(success(user));
}

export async function updateUser(req: Request, res: Response) {
  if (req.user!.userId !== req.params.id) {
    throw new AppError(403, "Cannot edit another user's profile");
  }

  const data = updateProfileSchema.parse(req.body);
  const user = await userService.updateUser(req.params.id as string, data);
  res.json(success(user));
}

export async function listUsers(req: Request, res: Response) {
  const cursor = req.query.cursor as string | undefined;
  const limit = Number(req.query.limit) || 20;
  const result = await userService.listUsers(cursor, limit);
  res.json(success(result));
}

export async function getUserPosts(req: Request, res: Response) {
  const cursor = req.query.cursor as string | undefined;
  const limit = Number(req.query.limit) || 20;
  const result = await userService.getUserPosts(req.params.id as string, cursor, limit);
  res.json(success(result));
}
