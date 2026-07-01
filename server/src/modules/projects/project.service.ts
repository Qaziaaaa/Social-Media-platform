import { prisma } from "../../database/prisma";
import { AppError } from "../../middleware/errorHandler";
import type { ProjectStatus, ProjectVisibility } from "@prisma/client";

export async function createProject(
  userId: string,
  data: {
    name: string;
    description?: string;
    category?: string;
    techStack?: string[];
    status?: ProjectStatus;
    visibility?: ProjectVisibility;
  },
) {
  return prisma.project.create({
    data: {
      userId,
      name: data.name,
      description: data.description,
      category: data.category,
      techStack: data.techStack ?? [],
      status: data.status ?? "idea",
      visibility: data.visibility ?? "public",
    },
  });
}

export async function getProjectsByUser(userId: string) {
  return prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { milestones: true, updates: true } } },
  });
}

export async function getProjectById(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, username: true, fullName: true, avatar: true },
      },
      _count: { select: { milestones: true, updates: true } },
    },
  });

  if (!project) throw new AppError(404, "Project not found");
  return project;
}

export async function updateProject(
  projectId: string,
  userId: string,
  data: {
    name?: string;
    description?: string;
    category?: string;
    techStack?: string[];
    status?: ProjectStatus;
    visibility?: ProjectVisibility;
  },
) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new AppError(404, "Project not found");
  if (project.userId !== userId) throw new AppError(403, "Cannot edit another user's project");

  return prisma.project.update({
    where: { id: projectId },
    data,
  });
}

export async function deleteProject(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new AppError(404, "Project not found");
  if (project.userId !== userId) throw new AppError(403, "Cannot delete another user's project");

  await prisma.project.delete({ where: { id: projectId } });
}
