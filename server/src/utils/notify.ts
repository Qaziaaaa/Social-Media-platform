import { prisma } from "../database/prisma";
import { getIO } from "../socket";

export async function notify(data: {
  userId: string;
  actorId: string;
  type: string;
  entityId?: string;
}) {
  if (data.userId === data.actorId) return null;

  const existing = await prisma.notification.findFirst({
    where: {
      userId: data.userId,
      actorId: data.actorId,
      type: data.type,
      entityId: data.entityId ?? null,
    },
    include: {
      actor: {
        select: { id: true, username: true, fullName: true, avatar: true },
      },
    },
  });

  if (existing) {
    await prisma.notification.update({
      where: { id: existing.id },
      data: { read: false, createdAt: new Date() },
    });
    try {
      const io = getIO();
      io.to(`user:${data.userId}`).emit("notification", existing);
    } catch {}
    return existing;
  }

  const notification = await prisma.notification.create({
    data,
    include: {
      actor: {
        select: { id: true, username: true, fullName: true, avatar: true },
      },
    },
  });

  try {
    const io = getIO();
    io.to(`user:${data.userId}`).emit("notification", notification);
  } catch {
    // socket not initialized
  }

  return notification;
}
