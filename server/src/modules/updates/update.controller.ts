import type { Request, Response } from "express";
import { createUpdateSchema, updateUpdateSchema } from "./update.validator";
import * as updateService from "./update.service";
import { success } from "../../types/responses";

export async function create(req: Request, res: Response) {
  const data = createUpdateSchema.parse(req.body);
  const update = await updateService.createUpdate(req.user!.userId, data.content, data.imageUrl);
  res.status(201).json(success(update));
}

export async function getById(req: Request, res: Response) {
  const update = await updateService.getUpdateById(req.params.id as string, req.user?.userId);
  res.json(success(update));
}

export async function update(req: Request, res: Response) {
  const data = updateUpdateSchema.parse(req.body);
  const update = await updateService.updateUpdate(req.params.id as string, req.user!.userId, data);
  res.json(success(update));
}

export async function remove(req: Request, res: Response) {
  await updateService.deleteUpdate(req.params.id as string, req.user!.userId);
  res.json(success({ message: "Update deleted" }));
}

export async function feed(req: Request, res: Response) {
  const cursor = req.query.cursor as string | undefined;
  const limit = Number(req.query.limit) || 20;
  const result = await updateService.getFeed(cursor, limit, req.user?.userId);
  res.json(success(result));
}
