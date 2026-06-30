import { prisma } from "../../database/prisma";
import { AppError } from "../../middleware/errorHandler";

const updateInclude = {
  author: {
    select: { id: true, username: true, fullName: true, avatar: true },
  },
  _count: { select: { comments: true, likes: true } },
};

export async function bookmarkUpdate(updateId: string, userId: string) {
  const update = await prisma.update.findUnique({ where: { id: updateId } });
  if (!update) throw new AppError(404, "Update not found");

  const existing = await prisma.bookmark.findUnique({
    where: { updateId_userId: { userId, updateId } },
  });

  if (existing) return { bookmarked: false };

  await prisma.bookmark.create({ data: { updateId, userId } });
  return { bookmarked: true };
}

export async function unbookmarkUpdate(updateId: string, userId: string) {
  const existing = await prisma.bookmark.findUnique({
    where: { updateId_userId: { userId, updateId } },
  });

  if (!existing) return { bookmarked: false };

  await prisma.bookmark.delete({
    where: { updateId_userId: { userId, updateId } },
  });
  return { bookmarked: false };
}

export async function getUserBookmarks(userId: string, cursor?: string, limit = 20) {
  const bookmarks = await prisma.bookmark.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { update: { include: updateInclude } },
  });

  const hasMore = bookmarks.length > limit;
  if (hasMore) bookmarks.pop();

  return {
    items: bookmarks.map((b) => b.update),
    nextCursor: hasMore ? bookmarks[bookmarks.length - 1]?.id ?? null : null,
  };
}
