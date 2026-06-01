import { prisma } from "../database/prisma";
import { getIO } from "../socket";

export async function notify(data: {
  userId: string;
  actorId: string;
  type: string;
  entityId?: string;
}) {
  if (data.userId === data.actorId) return null;

  const notification = await prisma.notification.create({ data });

  try {
    const actor = await prisma.user.findUnique({
      where: { id: data.actorId },
      select: { id: true, username: true, fullName: true, avatar: true },
    });
    const io = getIO();
    io.to(`user:${data.userId}`).emit("notification", {
      ...notification,
      actor,
    });
  } catch {
    // socket not initialized
  }

  return notification;
}
