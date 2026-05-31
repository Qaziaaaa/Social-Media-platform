import { prisma } from "../../database/prisma";
import { AppError } from "../../middleware/errorHandler";
import { sanitizeHtml } from "../../utils/sanitize";

const commentInclude = {
  author: {
    select: { id: true, username: true, fullName: true, avatar: true },
  },
};

export async function createComment(postId: string, authorId: string, content: string) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError(404, "Post not found");

  return prisma.comment.create({
    data: {
      postId,
      authorId,
      content: sanitizeHtml(content),
    },
    include: commentInclude,
  });
}

export async function getComments(postId: string, cursor?: string, limit = 20) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError(404, "Post not found");

  const comments = await prisma.comment.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    where: { postId },
    orderBy: { createdAt: "asc" },
    include: commentInclude,
  });

  const hasMore = comments.length > limit;
  if (hasMore) comments.pop();

  return {
    items: comments,
    nextCursor: hasMore ? comments[comments.length - 1]?.id ?? null : null,
  };
}

export async function deleteComment(commentId: string, userId: string) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new AppError(404, "Comment not found");
  if (comment.authorId !== userId) throw new AppError(403, "Cannot delete another user's comment");

  await prisma.comment.delete({ where: { id: commentId } });
}
