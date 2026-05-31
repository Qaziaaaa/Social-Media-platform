import { prisma } from "../../database/prisma";
import { AppError } from "../../middleware/errorHandler";

const postInclude = {
  author: {
    select: { id: true, username: true, fullName: true, avatar: true },
  },
  _count: { select: { comments: true, likes: true } },
};

export async function bookmarkPost(postId: string, userId: string) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError(404, "Post not found");

  const existing = await prisma.bookmark.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) return { bookmarked: false };

  await prisma.bookmark.create({ data: { postId, userId } });
  return { bookmarked: true };
}

export async function unbookmarkPost(postId: string, userId: string) {
  const existing = await prisma.bookmark.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (!existing) return { bookmarked: false };

  await prisma.bookmark.delete({
    where: { postId_userId: { postId, userId } },
  });
  return { bookmarked: false };
}

export async function getUserBookmarks(userId: string, cursor?: string, limit = 20) {
  const bookmarks = await prisma.bookmark.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { post: { include: postInclude } },
  });

  const hasMore = bookmarks.length > limit;
  if (hasMore) bookmarks.pop();

  return {
    items: bookmarks.map((b) => b.post),
    nextCursor: hasMore ? bookmarks[bookmarks.length - 1]?.id ?? null : null,
  };
}
