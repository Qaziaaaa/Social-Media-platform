import type { Request, Response } from "express";
import { success } from "../../types/responses";

export async function uploadFile(req: Request, res: Response) {
  if (!req.file) {
    res.status(400).json({ success: false, message: "No file provided" });
    return;
  }

  const url = `/uploads/${req.file.filename}`;
  res.json(success({ url }));
}
