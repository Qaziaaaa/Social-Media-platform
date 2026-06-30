import { prisma } from "../../database/prisma";
import { AppError } from "../../middleware/errorHandler";

export async function upsertHashtags(tags: string[]) {
  for (const tag of tags) {
    await prisma.hashtag.upsert({
      where: { tag },
      create: { tag },
      update: {},
    });
  }
}

export async function associateHashtags(updateId: string, tags: string[]) {
  if (tags.length === 0) return;

  await upsertHashtags(tags);

  const hashtags = await prisma.hashtag.findMany({
    where: { tag: { in: tags } },
  });

  await prisma.updateHashtag.createMany({
    data: hashtags.map((h) => ({ updateId, hashtagId: h.id })),
    skipDuplicates: true,
  });
}

export async function replaceHashtags(updateId: string, tags: string[]) {
  await prisma.updateHashtag.deleteMany({ where: { updateId } });
  if (tags.length > 0) {
    await associateHashtags(updateId, tags);
  }
}

export async function getUpdatesByHashtag(tag: string, cursor?: string, limit = 20) {
  const hashtag = await prisma.hashtag.findUnique({ where: { tag: tag.toLowerCase() } });
  if (!hashtag) {
    return { items: [], nextCursor: null };
  }

  const updateHashtags = await prisma.updateHashtag.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    where: { hashtagId: hashtag.id },
    orderBy: { createdAt: "desc" },
    include: {
      update: {
        include: {
          author: {
            select: { id: true, username: true, fullName: true, avatar: true },
          },
          _count: { select: { comments: true, likes: true } },
        },
      },
    },
  });

  const hasMore = updateHashtags.length > limit;
  if (hasMore) updateHashtags.pop();

  return {
    items: updateHashtags.map((uh) => uh.update),
    nextCursor: hasMore ? updateHashtags[updateHashtags.length - 1]?.id ?? null : null,
  };
}

export async function getTrendingHashtags(limit = 10) {
  const hashtags = await prisma.hashtag.findMany({
    take: limit,
    orderBy: { updates: { _count: "desc" } },
    include: { _count: { select: { updates: true } } },
  });

  return hashtags.map((h) => ({ tag: h.tag, count: h._count.updates }));
}
