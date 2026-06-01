import { prisma } from "../../database/prisma";

const notificationInclude = {
  actor: {
    select: { id: true, username: true, fullName: true, avatar: true },
  },
};

export async function createNotification(data: {
  userId: string;
  actorId: string;
  type: string;
  entityId?: string;
}) {
  if (data.userId === data.actorId) return null;

  return prisma.notification.create({
    data,
    include: notificationInclude,
  });
}

export async function getUserNotifications(userId: string, cursor?: string, limit = 20) {
  const notifications = await prisma.notification.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: notificationInclude,
  });

  const hasMore = notifications.length > limit;
  if (hasMore) notifications.pop();

  return {
    items: notifications,
    nextCursor: hasMore ? notifications[notifications.length - 1]?.id ?? null : null,
  };
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}

export async function markAsRead(notificationId: string, userId: string) {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  });
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}
