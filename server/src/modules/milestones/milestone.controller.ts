import type { Request, Response } from "express";
import { createMilestoneSchema, updateMilestoneSchema } from "./milestone.validator";
import * as milestoneService from "./milestone.service";
import { success } from "../../types/responses";

export async function create(req: Request, res: Response) {
  const data = createMilestoneSchema.parse(req.body);
  const milestone = await milestoneService.createMilestone(req.user!.userId, data);
  res.status(201).json(success(milestone));
}

export async function listByProject(req: Request, res: Response) {
  const milestones = await milestoneService.getMilestonesByProject(req.params.projectId as string);
  res.json(success(milestones));
}

export async function listMy(req: Request, res: Response) {
  const milestones = await milestoneService.getMyMilestones(req.user!.userId);
  res.json(success(milestones));
}

export async function getById(req: Request, res: Response) {
  const milestone = await milestoneService.getMilestoneById(req.params.id as string);
  res.json(success(milestone));
}

export async function update(req: Request, res: Response) {
  const data = updateMilestoneSchema.parse(req.body);
  const milestone = await milestoneService.updateMilestone(req.params.id as string, req.user!.userId, data);
  res.json(success(milestone));
}

export async function remove(req: Request, res: Response) {
  await milestoneService.deleteMilestone(req.params.id as string, req.user!.userId);
  res.json(success({ message: "Milestone deleted" }));
}
