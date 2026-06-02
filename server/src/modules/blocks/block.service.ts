import { prisma } from "../../database/prisma";
import { AppError } from "../../middleware/errorHandler";

export async function blockUser(blockerId: string, blockedId: string) {
  if (blockerId === blockedId) {
    throw new AppError(400, "Cannot block yourself");
  }

  const target = await prisma.user.findUnique({ where: { id: blockedId } });
  if (!target) throw new AppError(404, "User not found");

  const existing = await prisma.block.findUnique({
    where: { blockerId_blockedId: { blockerId, blockedId } },
  });

  if (existing) return { blocked: true };

  await prisma.block.create({ data: { blockerId, blockedId } });

  return { blocked: true };
}

export async function unblockUser(blockerId: string, blockedId: string) {
  const existing = await prisma.block.findUnique({
    where: { blockerId_blockedId: { blockerId, blockedId } },
  });

  if (!existing) return { blocked: false };

  await prisma.block.delete({
    where: { blockerId_blockedId: { blockerId, blockedId } },
  });

  return { blocked: false };
}

export async function getBlockedUsers(userId: string) {
  const blocks = await prisma.block.findMany({
    where: { blockerId: userId },
    include: {
      blocked: { select: { id: true, username: true, fullName: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return blocks;
}

export async function isBlocked(userId: string, targetUserId: string) {
  const block = await prisma.block.findUnique({
    where: { blockerId_blockedId: { blockerId: userId, blockedId: targetUserId } },
  });

  return { blocked: !!block };
}
