import { prisma } from "../../database/prisma";
import { AppError } from "../../middleware/errorHandler";

const userSelect = {
  id: true,
  username: true,
  email: true,
  fullName: true,
  bio: true,
  avatar: true,
  coverImage: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: { posts: true, followers: true, following: true },
  },
};

export async function getUserById(id: string, currentUserId?: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  let isFollowing = false;
  if (currentUserId) {
    const follow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: currentUserId, followingId: id } },
    });
    isFollowing = !!follow;
  }

  return { ...user, isFollowing };
}

export async function updateUser(id: string, data: {
  username?: string;
  fullName?: string;
  bio?: string;
  avatar?: string | null;
  coverImage?: string | null;
}) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (data.username && data.username !== user.username) {
    const existing = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existing) {
      throw new AppError(409, "Username already taken");
    }
  }

  return prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });
}

export async function listUsers(cursor?: string, limit = 20) {
  const users = await prisma.user.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "desc" },
    select: userSelect,
  });

  const hasMore = users.length > limit;
  if (hasMore) users.pop();

  return {
    items: users,
    nextCursor: hasMore ? users[users.length - 1]?.id ?? null : null,
  };
}

const postInclude = {
  author: {
    select: { id: true, username: true, fullName: true, avatar: true },
  },
  _count: { select: { comments: true, likes: true } },
};

export async function getSuggestedUsers(currentUserId: string, limit = 5) {
  const follows = await prisma.follow.findMany({
    where: { followerId: currentUserId },
    select: { followingId: true },
  });
  const excludedIds = [currentUserId, ...follows.map((f) => f.followingId)];

  return prisma.user.findMany({
    take: limit,
    where: { id: { notIn: excludedIds } },
    orderBy: { createdAt: "desc" },
    select: userSelect,
  });
}

export async function getUserPosts(userId: string, cursor?: string, limit = 20) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, "User not found");
  }

  const posts = await prisma.post.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    include: postInclude,
  });

  const hasMore = posts.length > limit;
  if (hasMore) posts.pop();

  return {
    items: posts,
    nextCursor: hasMore ? posts[posts.length - 1]?.id ?? null : null,
  };
}

export async function getUserLikedPosts(userId: string, cursor?: string, limit = 20) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, "User not found");
  }

  const likes = await prisma.like.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    where: { userId },
    orderBy: { id: "desc" },
    include: { post: { include: postInclude } },
  });

  const hasMore = likes.length > limit;
  if (hasMore) likes.pop();

  return {
    items: likes.map((l) => ({ ...l.post, isLiked: true })),
    nextCursor: hasMore ? likes[likes.length - 1]?.id ?? null : null,
  };
}

export async function getUserMediaPosts(userId: string, cursor?: string, limit = 20) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, "User not found");
  }

  const posts = await prisma.post.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    where: { authorId: userId, imageUrl: { not: null } },
    orderBy: { createdAt: "desc" },
    include: postInclude,
  });

  const hasMore = posts.length > limit;
  if (hasMore) posts.pop();

  return {
    items: posts,
    nextCursor: hasMore ? posts[posts.length - 1]?.id ?? null : null,
  };
}
