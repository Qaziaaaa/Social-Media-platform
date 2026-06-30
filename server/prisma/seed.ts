import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      username: "alice",
      email: "alice@example.com",
      fullName: "Alice Johnson",
      passwordHash,
      bio: "Full-stack developer & photographer",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      username: "bob",
      email: "bob@example.com",
      fullName: "Bob Smith",
      passwordHash,
      bio: "Writer and artist",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      username: "admin",
      email: "admin@example.com",
      fullName: "Admin User",
      passwordHash,
      role: "admin",
      bio: "Platform administrator",
    },
  });

  const update1 = await prisma.update.create({
    data: {
      authorId: alice.id,
      content: "Just finished building a new project! Really excited about how it turned out.",
    },
  });

  const update2 = await prisma.update.create({
    data: {
      authorId: bob.id,
      content: "What's everyone working on this weekend?",
    },
  });

  await prisma.comment.create({
    data: {
      updateId: update1.id,
      authorId: bob.id,
      content: "Looks awesome! Would love to see more.",
    },
  });

  await prisma.like.upsert({
    where: { updateId_userId: { updateId: update1.id, userId: bob.id } },
    update: {},
    create: { updateId: update1.id, userId: bob.id },
  });

  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: bob.id, followingId: alice.id } },
    update: {},
    create: { followerId: bob.id, followingId: alice.id },
  });

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
