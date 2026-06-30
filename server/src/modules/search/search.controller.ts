import type { Request, Response } from "express";
import { searchQuerySchema } from "./search.validator";
import * as searchService from "./search.service";
import { success } from "../../types/responses";

export async function search(req: Request, res: Response) {
  const { q, type, cursor, limit } = searchQuerySchema.parse(req.query);

  if (type === "users") {
    const result = await searchService.searchUsers(q, cursor, limit);
    res.json(success({ users: result.items, nextCursor: result.nextCursor }));
    return;
  }

  if (type === "updates") {
    const result = await searchService.searchUpdates(q, cursor, limit);
    res.json(success({ updates: result.items, nextCursor: result.nextCursor }));
    return;
  }

  const [users, updates, hashtags] = await Promise.all([
    searchService.searchUsers(q, undefined, 5),
    searchService.searchUpdates(q, cursor, limit),
    searchService.searchHashtags(q, 8),
  ]);

  res.json(success({ users: users.items, updates: updates.items, hashtags, nextCursor: updates.nextCursor }));
}
