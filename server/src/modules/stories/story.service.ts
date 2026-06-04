import { prisma } from "../../database/prisma";
import { AppError } from "../../middleware/errorHandler";

const storyInclude = {
  user: {
    select: { id: true, username: true, fullName: true, avatar: true },
  },
};

export async function createStory(userId: string, mediaUrl: string) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const story = await prisma.story.create({
    data: { userId, mediaUrl, expiresAt },
    include: storyInclude,
  });

  return story;
}

export async function getFollowingStories(currentUserId: string) {
  const following = await prisma.follow.findMany({
    where: { followerId: currentUserId },
    select: { followingId: true },
  });

  const followingIds = following.map((f) => f.followingId);

  const stories = await prisma.story.findMany({
    where: {
      userId: { in: followingIds },
      expiresAt: { gt: new Date() },
    },
    include: storyInclude,
    orderBy: { createdAt: "desc" },
  });

  const grouped: Record<string, { user: typeof stories[0]["user"]; stories: typeof stories }> = {};

  for (const story of stories) {
    if (!grouped[story.userId]) {
      grouped[story.userId] = { user: story.user, stories: [] };
    }
    grouped[story.userId].stories.push(story);
  }

  return Object.values(grouped).sort(
    (a, b) => b.stories[0].createdAt.getTime() - a.stories[0].createdAt.getTime(),
  );
}

export async function getUserStories(userId: string) {
  const stories = await prisma.story.findMany({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
    include: storyInclude,
    orderBy: { createdAt: "desc" },
  });

  return stories;
}

export async function deleteStory(storyId: string, userId: string) {
  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) throw new AppError(404, "Story not found");
  if (story.userId !== userId) throw new AppError(403, "Not your story");

  await prisma.story.delete({ where: { id: storyId } });
}

export async function cleanupExpiredStories() {
  await prisma.story.deleteMany({
    where: { expiresAt: { lte: new Date() } },
  });
}
