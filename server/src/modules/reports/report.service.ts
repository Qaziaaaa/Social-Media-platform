import { prisma } from "../../database/prisma";
import { AppError } from "../../middleware/errorHandler";

export async function createReport(
  reporterId: string,
  targetType: string,
  targetId: string,
  reason: string,
) {
  if (targetType === "user" && reporterId === targetId) {
    throw new AppError(400, "Cannot report yourself");
  }

  const existing = await prisma.report.findFirst({
    where: { reporterId, targetType, targetId, status: "pending" },
  });

  if (existing) {
    throw new AppError(400, "You already have a pending report for this");
  }

  const report = await prisma.report.create({
    data: { reporterId, targetType, targetId, reason },
  });

  return report;
}

export async function getReports(status?: string) {
  const where = status && status !== "all" ? { status } : {};

  const reports = await prisma.report.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { id: true, username: true, fullName: true } },
    },
  });

  return reports;
}

export async function updateReportStatus(reportId: string, status: string) {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new AppError(404, "Report not found");

  return prisma.report.update({
    where: { id: reportId },
    data: { status },
  });
}
