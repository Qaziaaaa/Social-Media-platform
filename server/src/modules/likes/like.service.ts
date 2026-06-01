import { prisma } from "../../database/prisma";
import { AppError } from "../../middleware/errorHandler";
import { notify } from "../../utils/notify";

export async function likePost(postId: string, userId: string) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError(404, "Post not found");

  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) return { liked: false };

  await prisma.like.create({ data: { postId, userId } });

  await notify({
    userId: post.authorId,
    actorId: userId,
    type: "like",
    entityId: postId,
  });

  return { liked: true };
}

export async function unlikePost(postId: string, userId: string) {
  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (!existing) return { liked: false };

  await prisma.like.delete({
    where: { postId_userId: { postId, userId } },
  });
  return { liked: false };
}
