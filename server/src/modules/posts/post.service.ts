import { prisma } from "../../database/prisma";
import { AppError } from "../../middleware/errorHandler";
import { sanitizeHtml } from "../../utils/sanitize";
import { parseHashtags } from "../../utils/hashtags";
import { associateHashtags, replaceHashtags } from "../hashtags/hashtag.service";

const postInclude = {
  author: {
    select: { id: true, username: true, fullName: true, avatar: true },
  },
  _count: { select: { comments: true, likes: true } },
};

export async function createPost(authorId: string, content: string, imageUrl?: string) {
  const sanitized = sanitizeHtml(content);
  const post = await prisma.post.create({
    data: {
      authorId,
      content: sanitized,
      imageUrl,
    },
    include: postInclude,
  });

  const tags = parseHashtags(sanitized);
  if (tags.length > 0) {
    await associateHashtags(post.id, tags);
  }

  return post;
}

export async function getPostById(id: string, currentUserId?: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      ...postInclude,
      likes: currentUserId
        ? { where: { userId: currentUserId }, take: 1 }
        : false,
    },
  });

  if (!post) {
    throw new AppError(404, "Post not found");
  }

  const { likes, ...rest } = post;
  return {
    ...rest,
    isLiked: Array.isArray(likes) ? likes.length > 0 : false,
  };
}

export async function updatePost(postId: string, userId: string, data: { content?: string; imageUrl?: string }) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError(404, "Post not found");
  if (post.authorId !== userId) throw new AppError(403, "Cannot edit another user's post");

  const updateData: Record<string, string> = {};
  if (data.content) {
    const sanitized = sanitizeHtml(data.content);
    updateData.content = sanitized;
  }
  if (data.imageUrl) {
    updateData.imageUrl = data.imageUrl;
  }

  const updated = await prisma.post.update({
    where: { id: postId },
    data: updateData,
    include: postInclude,
  });

  if (data.content) {
    const tags = parseHashtags(updateData.content!);
    await replaceHashtags(postId, tags);
  }

  return updated;
}

export async function repostPost(postId: string, userId: string) {
  const original = await prisma.post.findUnique({ where: { id: postId } });
  if (!original) throw new AppError(404, "Post not found");

  return prisma.post.create({
    data: {
      authorId: userId,
      content: original.content,
      imageUrl: original.imageUrl,
      originalPostId: original.id,
    },
    include: postInclude,
  });
}

export async function deletePost(postId: string, userId: string) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError(404, "Post not found");
  if (post.authorId !== userId) throw new AppError(403, "Cannot delete another user's post");

  await prisma.post.delete({ where: { id: postId } });
}

export async function getFeed(cursor?: string, limit = 20, currentUserId?: string) {
  const posts = await prisma.post.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { id: true, username: true, fullName: true, avatar: true },
      },
      _count: { select: { comments: true, likes: true } },
      ...(currentUserId
        ? { likes: { where: { userId: currentUserId }, take: 1 } }
        : {}),
    },
  });

  const hasMore = posts.length > limit;
  if (hasMore) posts.pop();

  const items = posts.map(({ likes, ...rest }) => ({
    ...rest,
    isLiked: Array.isArray(likes) ? likes.length > 0 : false,
  }));

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
  };
}
