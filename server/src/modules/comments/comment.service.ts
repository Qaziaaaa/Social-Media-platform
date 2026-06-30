import { prisma } from "../../database/prisma";
import { AppError } from "../../middleware/errorHandler";
import { sanitizeHtml } from "../../utils/sanitize";
import { notify } from "../../utils/notify";

const commentInclude = {
  author: {
    select: { id: true, username: true, fullName: true, avatar: true },
  },
  _count: { select: { likes: true } },
};

const replyInclude = {
  author: {
    select: { id: true, username: true, fullName: true, avatar: true },
  },
  _count: { select: { likes: true } },
};

export async function createComment(
  updateId: string,
  authorId: string,
  content: string,
  parentId?: string,
) {
  const update = await prisma.update.findUnique({ where: { id: updateId } });
  if (!update) throw new AppError(404, "Update not found");

  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } });
    if (!parent || parent.updateId !== updateId) {
      throw new AppError(400, "Invalid parent comment");
    }
  }

  const comment = await prisma.comment.create({
    data: {
      updateId,
      authorId,
      content: sanitizeHtml(content),
      parentId,
    },
    include: commentInclude,
  });

  await notify({
    userId: update.authorId,
    actorId: authorId,
    type: "comment",
    entityId: updateId,
  });

  return comment;
}

export async function getComments(updateId: string, cursor?: string, limit = 20, currentUserId?: string) {
  const update = await prisma.update.findUnique({ where: { id: updateId } });
  if (!update) throw new AppError(404, "Update not found");

  const parents = await prisma.comment.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    where: { updateId, parentId: null },
    orderBy: { createdAt: "asc" },
    include: {
      ...commentInclude,
      ...(currentUserId
        ? { likes: { where: { userId: currentUserId }, take: 1 } }
        : {}),
    },
  });

  const hasMore = parents.length > limit;
  if (hasMore) parents.pop();

  const parentIds = parents.map((c) => c.id);

  const replies = parentIds.length > 0
    ? await prisma.comment.findMany({
        where: { parentId: { in: parentIds } },
        orderBy: { createdAt: "asc" },
        include: {
          ...replyInclude,
          ...(currentUserId
            ? { likes: { where: { userId: currentUserId }, take: 1 } }
            : {}),
        },
      })
    : [];

  const replyMap = new Map<string, typeof replies>();
  for (const reply of replies) {
    const group = replyMap.get(reply.parentId!) || [];
    group.push(reply);
    replyMap.set(reply.parentId!, group);
  }

  const items = parents.map(({ likes, ...rest }) => {
    const parentLikes = Array.isArray(likes) ? likes : [];
    const commentReplies = (replyMap.get(rest.id) || []).map(({ likes: rl, ...replyRest }) => ({
      ...replyRest,
      isLiked: Array.isArray(rl) ? rl.length > 0 : false,
    }));

    return {
      ...rest,
      isLiked: parentLikes.length > 0,
      replies: commentReplies,
    };
  });

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
  };
}

export async function deleteComment(commentId: string, userId: string) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new AppError(404, "Comment not found");
  if (comment.authorId !== userId) throw new AppError(403, "Cannot delete another user's comment");

  await prisma.comment.delete({ where: { id: commentId } });
}
