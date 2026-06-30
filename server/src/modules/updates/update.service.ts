import { prisma } from "../../database/prisma";
import { AppError } from "../../middleware/errorHandler";
import { sanitizeHtml } from "../../utils/sanitize";
import { parseHashtags } from "../../utils/hashtags";
import { associateHashtags, replaceHashtags } from "../hashtags/hashtag.service";

const updateInclude = {
  author: {
    select: { id: true, username: true, fullName: true, avatar: true },
  },
  _count: { select: { comments: true, likes: true } },
};

export async function createUpdate(authorId: string, content: string, imageUrl?: string) {
  const sanitized = sanitizeHtml(content);
  const update = await prisma.update.create({
    data: {
      authorId,
      content: sanitized,
      imageUrl,
    },
    include: updateInclude,
  });

  const tags = parseHashtags(sanitized);
  if (tags.length > 0) {
    await associateHashtags(update.id, tags);
  }

  return update;
}

export async function getUpdateById(id: string, currentUserId?: string) {
  const update = await prisma.update.findUnique({
    where: { id },
    include: {
      ...updateInclude,
      likes: currentUserId
        ? { where: { userId: currentUserId }, take: 1 }
        : false,
      bookmarks: currentUserId
        ? { where: { userId: currentUserId }, take: 1 }
        : false,
    },
  });

  if (!update) {
    throw new AppError(404, "Update not found");
  }

  const { likes, bookmarks, ...rest } = update;
  return {
    ...rest,
    isLiked: Array.isArray(likes) ? likes.length > 0 : false,
    isBookmarked: Array.isArray(bookmarks) ? bookmarks.length > 0 : false,
  };
}

export async function updateUpdate(updateId: string, userId: string, data: { content?: string; imageUrl?: string }) {
  const update = await prisma.update.findUnique({ where: { id: updateId } });
  if (!update) throw new AppError(404, "Update not found");
  if (update.authorId !== userId) throw new AppError(403, "Cannot edit another user's update");

  const updateData: Record<string, string> = {};
  if (data.content) {
    const sanitized = sanitizeHtml(data.content);
    updateData.content = sanitized;
  }
  if (data.imageUrl) {
    updateData.imageUrl = data.imageUrl;
  }

  const updated = await prisma.update.update({
    where: { id: updateId },
    data: updateData,
    include: updateInclude,
  });

  if (data.content) {
    const tags = parseHashtags(updateData.content!);
    await replaceHashtags(updateId, tags);
  }

  return updated;
}

export async function deleteUpdate(updateId: string, userId: string) {
  const update = await prisma.update.findUnique({ where: { id: updateId } });
  if (!update) throw new AppError(404, "Update not found");
  if (update.authorId !== userId) throw new AppError(403, "Cannot delete another user's update");

  await prisma.update.delete({ where: { id: updateId } });
}

export async function getFeed(cursor?: string, limit = 20, currentUserId?: string) {
  const updates = await prisma.update.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "desc" },
    where: { author: { suspended: false } },
    include: {
      author: {
        select: { id: true, username: true, fullName: true, avatar: true },
      },
      _count: { select: { comments: true, likes: true } },
      ...(currentUserId
        ? {
            likes: { where: { userId: currentUserId }, take: 1 },
            bookmarks: { where: { userId: currentUserId }, take: 1 },
          }
        : {}),
    },
  });

  const hasMore = updates.length > limit;
  if (hasMore) updates.pop();

  const items = updates.map(({ likes, bookmarks, ...rest }) => ({
    ...rest,
    isLiked: Array.isArray(likes) ? likes.length > 0 : false,
    isBookmarked: Array.isArray(bookmarks) ? bookmarks.length > 0 : false,
  }));

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
  };
}
