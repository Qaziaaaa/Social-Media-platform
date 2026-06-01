import type { Request, Response } from "express";
import * as messageService from "./message.service";
import { createConversationSchema, sendMessageSchema } from "./message.validator";
import { success } from "../../types/responses";

export async function listConversations(req: Request, res: Response) {
  const conversations = await messageService.getConversations(req.user!.userId);
  res.json(success(conversations));
}

export async function getConversation(req: Request, res: Response) {
  const conversation = await messageService.getConversation(req.params.id as string, req.user!.userId);
  res.json(success(conversation));
}

export async function createConversation(req: Request, res: Response) {
  const { participantIds } = createConversationSchema.parse(req.body);
  const conversation = await messageService.createConversation(req.user!.userId, participantIds);
  res.json(success(conversation));
}

export async function sendMessage(req: Request, res: Response) {
  const { content } = sendMessageSchema.parse(req.body);
  const message = await messageService.sendMessage(req.params.id as string, req.user!.userId, content);
  res.json(success(message));
}

export async function getMessages(req: Request, res: Response) {
  const cursor = req.query.cursor as string | undefined;
  const limit = Number(req.query.limit) || 30;
  const result = await messageService.getMessages(req.params.id as string, req.user!.userId, cursor, limit);
  res.json(success(result));
}
