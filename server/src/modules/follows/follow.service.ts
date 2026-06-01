import { prisma } from "../../database/prisma";
import { AppError } from "../../middleware/errorHandler";
import { notify } from "../../utils/notify";

export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new AppError(400, "Cannot follow yourself");
  }

  const target = await prisma.user.findUnique({ where: { id: followingId } });
  if (!target) throw new AppError(404, "User not found");

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });

  if (existing) return { followed: false };

  await prisma.follow.create({ data: { followerId, followingId } });

  await notify({
    userId: followingId,
    actorId: followerId,
    type: "follow",
  });

  return { followed: true };
}

export async function unfollowUser(followerId: string, followingId: string) {
  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });

  if (!existing) return { followed: false };

  await prisma.follow.delete({
    where: { followerId_followingId: { followerId, followingId } },
  });
  return { followed: false };
}
