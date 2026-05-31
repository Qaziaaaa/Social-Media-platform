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

export async function associateHashtags(postId: string, tags: string[]) {
  if (tags.length === 0) return;

  await upsertHashtags(tags);

  const hashtags = await prisma.hashtag.findMany({
    where: { tag: { in: tags } },
  });

  await prisma.postHashtag.createMany({
    data: hashtags.map((h) => ({ postId, hashtagId: h.id })),
    skipDuplicates: true,
  });
}

export async function replaceHashtags(postId: string, tags: string[]) {
  await prisma.postHashtag.deleteMany({ where: { postId } });
  if (tags.length > 0) {
    await associateHashtags(postId, tags);
  }
}

export async function getPostsByHashtag(tag: string, cursor?: string, limit = 20) {
  const hashtag = await prisma.hashtag.findUnique({ where: { tag: tag.toLowerCase() } });
  if (!hashtag) {
    return { items: [], nextCursor: null };
  }

  const postHashtags = await prisma.postHashtag.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    where: { hashtagId: hashtag.id },
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        include: {
          author: {
            select: { id: true, username: true, fullName: true, avatar: true },
          },
          _count: { select: { comments: true, likes: true } },
        },
      },
    },
  });

  const hasMore = postHashtags.length > limit;
  if (hasMore) postHashtags.pop();

  return {
    items: postHashtags.map((ph) => ph.post),
    nextCursor: hasMore ? postHashtags[postHashtags.length - 1]?.id ?? null : null,
  };
}

export async function getTrendingHashtags(limit = 10) {
  const hashtags = await prisma.hashtag.findMany({
    take: limit,
    orderBy: { posts: { _count: "desc" } },
    include: { _count: { select: { posts: true } } },
  });

  return hashtags.map((h) => ({ tag: h.tag, count: h._count.posts }));
}
