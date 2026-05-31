import { prisma } from "../../database/prisma";
import { AppError } from "../../middleware/errorHandler";
import { sanitizeHtml } from "../../utils/sanitize";

const postInclude = {
  author: {
    select: { id: true, username: true, fullName: true, avatar: true },
  },
  _count: { select: { comments: true, likes: true } },
};

export async function createPost(authorId: string, content: string, imageUrl?: string) {
  return prisma.post.create({
    data: {
      authorId,
      content: sanitizeHtml(content),
      imageUrl,
    },
    include: postInclude,
  });
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

  return prisma.post.update({
    where: { id: postId },
    data: {
      ...(data.content && { content: sanitizeHtml(data.content) }),
      ...(data.imageUrl && { imageUrl: data.imageUrl }),
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
