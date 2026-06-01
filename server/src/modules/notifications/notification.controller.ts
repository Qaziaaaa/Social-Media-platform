import type { Request, Response } from "express";
import * as notificationService from "./notification.service";
import { success } from "../../types/responses";

export async function list(req: Request, res: Response) {
  const cursor = req.query.cursor as string | undefined;
  const limit = Number(req.query.limit) || 20;
  const result = await notificationService.getUserNotifications(req.user!.userId, cursor, limit);
  res.json(success(result));
}

export async function unreadCount(_req: Request, res: Response) {
  const count = await notificationService.getUnreadCount(_req.user!.userId);
  res.json(success({ count }));
}

export async function markRead(req: Request, res: Response) {
  await notificationService.markAsRead(req.params.id as string, req.user!.userId);
  res.json(success({ read: true }));
}

export async function markAllRead(req: Request, res: Response) {
  await notificationService.markAllAsRead(req.user!.userId);
  res.json(success({ read: true }));
}
