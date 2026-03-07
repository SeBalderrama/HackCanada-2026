import { Request, Response } from "express";
import { uploadImage } from "../services/cloudinaryService";

export const uploadImageOnly = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "image file is required" });
      return;
    }

    const result = await uploadImage(req.file.buffer, req.file.originalname);

    res.json({
      url: result.url,
      publicId: result.publicId,
      tags: result.tags,
    });
  } catch (error: any) {
    const message = error?.message || "Image upload failed";
    res.status(500).json({ error: message });
  }
};
