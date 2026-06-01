import { prisma } from "../../database/prisma";
import { AppError } from "../../middleware/errorHandler";
import { emitMessage } from "../../socket";

const messageInclude = {
  sender: {
    select: { id: true, username: true, fullName: true, avatar: true },
  },
} as const;

const conversationInclude = {
  participants: {
    include: {
      user: {
        select: { id: true, username: true, fullName: true, avatar: true },
      },
    },
  },
  messages: {
    take: 1,
    orderBy: { createdAt: "desc" as const },
    include: messageInclude,
  },
} as const;

export async function createConversation(userId: string, participantIds: string[]) {
  const allIds = [...new Set([userId, ...participantIds])];
  if (allIds.length < 2) {
    throw new AppError(400, "Conversation needs at least 2 participants");
  }

  return prisma.$transaction(async (tx) => {
    const existing = await tx.conversation.findFirst({
      where: {
        AND: allIds.map((id) => ({
          participants: { some: { userId: id } },
        })),
      },
      include: conversationInclude,
    });

    if (existing) {
      const otherParticipants = existing.participants.filter((p: any) => p.userId !== userId);
      const lastMessage = existing.messages[0] ?? null;
      return { ...existing, otherParticipants, lastMessage, messages: undefined };
    }

    const conversation = await tx.conversation.create({
      data: {
        participants: {
          create: allIds.map((id) => ({ userId: id })),
        },
      },
      include: conversationInclude,
    });

    const otherParticipants = conversation.participants.filter((p: any) => p.userId !== userId);
    const lastMessage = conversation.messages[0] ?? null;
    return { ...conversation, otherParticipants, lastMessage, messages: undefined };
  });
}

export async function getConversations(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: { some: { userId } },
    },
    orderBy: { updatedAt: "desc" as const },
    include: conversationInclude,
  });

  const seen = new Set<string>();
  return conversations
    .filter((c: any) => {
      const otherIds = c.participants
        .filter((p: any) => p.userId !== userId)
        .map((p: any) => p.userId)
        .sort();
      const key = otherIds.join(",");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((c: any) => {
      const otherParticipants = c.participants.filter((p: any) => p.userId !== userId);
      const lastMessage = c.messages[0] ?? null;
      return { ...c, otherParticipants, lastMessage, messages: undefined };
    });
}

export async function getConversation(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      participants: { some: { userId } },
    },
    include: conversationInclude,
  });

  if (!conversation) throw new AppError(404, "Conversation not found");

  const otherParticipants = conversation.participants.filter((p: any) => p.userId !== userId);
  const lastMessage = conversation.messages[0] ?? null;
  return { ...conversation, otherParticipants, lastMessage, messages: undefined };
}

export async function sendMessage(conversationId: string, senderId: string, content: string) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId, userId: senderId },
    },
  });

  if (!participant) throw new AppError(403, "Not a participant of this conversation");

  const message = await prisma.message.create({
    data: { conversationId, senderId, content },
    include: messageInclude,
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  const participantIds = (await prisma.conversationParticipant.findMany({
    where: { conversationId },
    select: { userId: true },
  })).map((p) => p.userId);
  emitMessage(conversationId, message, participantIds);

  return message;
}

export async function getMessages(conversationId: string, userId: string, cursor?: string, limit = 30) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId, userId },
    },
  });

  if (!participant) throw new AppError(403, "Not a participant");

  const messages = await prisma.message.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    where: { conversationId },
    orderBy: { createdAt: "desc" as const },
    include: messageInclude,
  });

  const hasMore = messages.length > limit;
  if (hasMore) messages.pop();

  return {
    items: messages.reverse(),
    nextCursor: hasMore ? messages[0]?.id ?? null : null,
  };
}
