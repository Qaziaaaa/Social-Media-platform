import { prisma } from "../../database/prisma";
import { AppError } from "../../middleware/errorHandler";
import type { MilestoneStatus } from "@prisma/client";

async function verifyProjectOwnership(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new AppError(404, "Project not found");
  if (project.userId !== userId) throw new AppError(403, "Not your project");
}

export async function createMilestone(
  userId: string,
  data: {
    projectId: string;
    name: string;
    description?: string;
    status?: MilestoneStatus;
    dueDate?: string;
  },
) {
  await verifyProjectOwnership(data.projectId, userId);

  return prisma.milestone.create({
    data: {
      projectId: data.projectId,
      name: data.name,
      description: data.description,
      status: data.status ?? "planned",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
  });
}

export async function getMilestonesByProject(projectId: string) {
  return prisma.milestone.findMany({
    where: { projectId },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "asc" }],
  });
}

export async function getMyMilestones(userId: string) {
  return prisma.milestone.findMany({
    where: { project: { userId } },
    orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
    include: {
      project: { select: { id: true, name: true } },
    },
  });
}

export async function getMilestoneById(id: string) {
  const milestone = await prisma.milestone.findUnique({
    where: { id },
    include: {
      project: { select: { userId: true, name: true } },
    },
  });

  if (!milestone) throw new AppError(404, "Milestone not found");
  return milestone;
}

export async function updateMilestone(
  milestoneId: string,
  userId: string,
  data: {
    name?: string;
    description?: string;
    status?: MilestoneStatus;
    dueDate?: string | null;
  },
) {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { project: { select: { userId: true } } },
  });

  if (!milestone) throw new AppError(404, "Milestone not found");
  if (milestone.project.userId !== userId) throw new AppError(403, "Not your project");

  return prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      ...data,
      dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
    },
  });
}

export async function deleteMilestone(milestoneId: string, userId: string) {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { project: { select: { userId: true } } },
  });

  if (!milestone) throw new AppError(404, "Milestone not found");
  if (milestone.project.userId !== userId) throw new AppError(403, "Not your project");

  await prisma.milestone.delete({ where: { id: milestoneId } });
}
