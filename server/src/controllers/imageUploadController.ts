import type { Request, Response } from "express";
import path from "path";
import fs from "fs";
import cloudinary, {
  isCloudinaryConfigured,
} from "../config/cloudinary";

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

    if (!isCloudinaryConfigured) {
      fs.unlinkSync(path.resolve(req.file.path));

      res.status(503).json({
        success: false,
        message:
          "Image uploads are not configured. Add the Cloudinary environment variables to the server.",
      });

      return;
    }

    const uploadedImage =
      await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: "traditional-girlswear/products",
          resource_type: "image",
        },
      );

    // The local upload is only a temporary bridge to Cloudinary.
    fs.unlinkSync(path.resolve(req.file.path));

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        imageUrl: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
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
