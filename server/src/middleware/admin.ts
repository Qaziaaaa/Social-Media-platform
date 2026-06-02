import { Request, Response, NextFunction } from "express";
import { prisma } from "../database/prisma";
import { AppError } from "./errorHandler";

export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { role: true },
  });

  if (!user || user.role !== "admin") {
    throw new AppError(403, "Admin access required");
  }

  next();
}
