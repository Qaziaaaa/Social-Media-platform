import { prisma } from "../../database/prisma";
import { AppError } from "../../middleware/errorHandler";
import { notify } from "../../utils/notify";

export async function likeUpdate(updateId: string, userId: string) {
  const update = await prisma.update.findUnique({ where: { id: updateId } });
  if (!update) throw new AppError(404, "Update not found");

  const existing = await prisma.like.findUnique({
    where: { updateId_userId: { userId, updateId } },
  });

  if (existing) return { liked: false };

  await prisma.like.create({ data: { updateId, userId } });

  await notify({
    userId: update.authorId,
    actorId: userId,
    type: "like",
    entityId: updateId,
  });

  return { liked: true };
}

export async function unlikeUpdate(updateId: string, userId: string) {
  const existing = await prisma.like.findUnique({
    where: { updateId_userId: { userId, updateId } },
  });

  if (!existing) return { liked: false };

  await prisma.like.delete({
    where: { updateId_userId: { userId, updateId } },
  });
  return { liked: false };
}
