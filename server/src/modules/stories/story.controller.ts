import type { Request, Response } from "express";
import { createStorySchema } from "./story.validator";
import * as storyService from "./story.service";
import { success } from "../../types/responses";

export async function create(req: Request, res: Response) {
  const data = createStorySchema.parse(req.body);
  const story = await storyService.createStory(req.user!.userId, data.mediaUrl);
  res.status(201).json(success(story));
}

export async function getFollowing(req: Request, res: Response) {
  const stories = await storyService.getFollowingStories(req.user!.userId);
  res.json(success(stories));
}

export async function getByUser(req: Request, res: Response) {
  const stories = await storyService.getUserStories(req.params.userId as string);
  res.json(success(stories));
}

export async function remove(req: Request, res: Response) {
  await storyService.deleteStory(req.params.id as string, req.user!.userId);
  res.json(success({ message: "Story deleted" }));
}
