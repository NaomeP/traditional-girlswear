import type { Request, Response } from "express";
import path from "path";
import fs from "fs";

export async function uploadProductImage(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Please select an image",
      });

      return;
    }

    const imageUrl = `/uploads/products/${req.file.filename}`;

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error(
      "Failed to upload product image:",
      error,
    );

    if (req.file?.path) {
      try {
        fs.unlinkSync(
          path.resolve(req.file.path),
        );
      } catch {
        // Ignore cleanup errors
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to upload image",
    });
  }
}