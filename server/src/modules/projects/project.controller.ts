import type { Request, Response } from "express";
import { createProjectSchema, updateProjectSchema } from "./project.validator";
import * as projectService from "./project.service";
import { success } from "../../types/responses";

export async function create(req: Request, res: Response) {
  const data = createProjectSchema.parse(req.body);
  const project = await projectService.createProject(req.user!.userId, data);
  res.status(201).json(success(project));
}

export async function list(req: Request, res: Response) {
  const projects = await projectService.getProjectsByUser(req.user!.userId);
  res.json(success(projects));
}

export async function getById(req: Request, res: Response) {
  const project = await projectService.getProjectById(req.params.id as string);
  res.json(success(project));
}

export async function update(req: Request, res: Response) {
  const data = updateProjectSchema.parse(req.body);
  const project = await projectService.updateProject(req.params.id as string, req.user!.userId, data);
  res.json(success(project));
}

export async function remove(req: Request, res: Response) {
  await projectService.deleteProject(req.params.id as string, req.user!.userId);
  res.json(success({ message: "Project deleted" }));
}
