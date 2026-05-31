import { prisma } from "../../database/prisma";
import { AppError } from "../../middleware/errorHandler";
import { sanitizeHtml } from "../../utils/sanitize";

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
  postId: string,
  authorId: string,
  content: string,
  parentId?: string,
) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError(404, "Post not found");

  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } });
    if (!parent || parent.postId !== postId) {
      throw new AppError(400, "Invalid parent comment");
    }
  }

  return prisma.comment.create({
    data: {
      postId,
      authorId,
      content: sanitizeHtml(content),
      parentId,
    },
    include: commentInclude,
  });
}

export async function getComments(postId: string, cursor?: string, limit = 20, currentUserId?: string) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError(404, "Post not found");

  const parents = await prisma.comment.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    where: { postId, parentId: null },
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
