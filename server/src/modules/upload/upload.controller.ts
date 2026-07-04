import type { Request, Response } from "express";
import { success } from "../../types/responses";

export async function uploadFile(req: Request, res: Response) {
  if (!req.file) {
    res.status(400).json({ success: false, message: "No file provided" });
    return;
  }

  const useCloudinary = !!process.env.CLOUDINARY_URL;
  const url = useCloudinary ? req.file.path : `/uploads/${req.file.filename}`;
  res.json(success({ url }));
}
