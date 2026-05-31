import { prisma } from "../../database/prisma";

export async function searchUsers(q: string, cursor?: string, limit = 20) {
  const users = await prisma.user.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    where: {
      OR: [
        { username: { contains: q, mode: "insensitive" } },
        { fullName: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: { username: "asc" },
    select: {
      id: true,
      username: true,
      fullName: true,
      avatar: true,
      bio: true,
      _count: { select: { posts: true, followers: true, following: true } },
    },
  });

  const hasMore = users.length > limit;
  if (hasMore) users.pop();

  return {
    items: users,
    nextCursor: hasMore ? users[users.length - 1]?.id ?? null : null,
  };
}

export async function searchHashtags(q: string, limit = 10) {
  const hashtags = await prisma.hashtag.findMany({
    take: limit,
    where: { tag: { contains: q, mode: "insensitive" } },
    orderBy: { tag: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return hashtags.map((h) => ({ tag: h.tag, count: h._count.posts }));
}

export async function searchPosts(q: string, cursor?: string, limit = 20) {
  const posts = await prisma.post.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    where: {
      content: { contains: q, mode: "insensitive" },
    },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { id: true, username: true, fullName: true, avatar: true },
      },
      _count: { select: { comments: true, likes: true } },
    },
  });

  const hasMore = posts.length > limit;
  if (hasMore) posts.pop();

  return {
    items: posts,
    nextCursor: hasMore ? posts[posts.length - 1]?.id ?? null : null,
  };
}
