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

  if (type === "posts") {
    const result = await searchService.searchPosts(q, cursor, limit);
    res.json(success({ posts: result.items, nextCursor: result.nextCursor }));
    return;
  }

  const [users, posts, hashtags] = await Promise.all([
    searchService.searchUsers(q, undefined, 5),
    searchService.searchPosts(q, cursor, limit),
    searchService.searchHashtags(q, 8),
  ]);

  res.json(success({ users: users.items, posts: posts.items, hashtags, nextCursor: posts.nextCursor }));
}
