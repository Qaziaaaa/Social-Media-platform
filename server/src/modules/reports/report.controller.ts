import type { Request, Response } from "express";
import * as reportService from "./report.service";
import { success } from "../../types/responses";

export async function create(req: Request, res: Response) {
  const { targetType, targetId, reason } = req.body;
  const result = await reportService.createReport(req.user!.userId, targetType, targetId, reason);
  res.status(201).json(success(result));
}

export async function list(req: Request, res: Response) {
  const status = req.query.status as string | undefined;
  const result = await reportService.getReports(status);
  res.json(success(result));
}

export async function updateStatus(req: Request, res: Response) {
  const result = await reportService.updateReportStatus(req.params.id as string, req.body.status);
  res.json(success(result));
}
