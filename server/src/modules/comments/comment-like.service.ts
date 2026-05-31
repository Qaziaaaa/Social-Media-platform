import { prisma } from "../../database/prisma";
import { AppError } from "../../middleware/errorHandler";

export async function likeComment(commentId: string, userId: string) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new AppError(404, "Comment not found");

  const existing = await prisma.commentLike.findUnique({
    where: { commentId_userId: { commentId, userId } },
  });

  if (existing) return { liked: false };

  await prisma.commentLike.create({ data: { commentId, userId } });
  return { liked: true };
}

export async function unlikeComment(commentId: string, userId: string) {
  const existing = await prisma.commentLike.findUnique({
    where: { commentId_userId: { commentId, userId } },
  });

  if (!existing) return { liked: false };

  await prisma.commentLike.delete({
    where: { commentId_userId: { commentId, userId } },
  });
  return { liked: false };
}
