import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import {
  requireAuth,
} from "../middleware/authMiddleware";

import {
  requireAdmin,
} from "../middleware/roleMiddleware";

import {
  uploadProductImage,
} from "../controllers/imageUploadController";

const router = Router();

const uploadDirectory = path.resolve(
  process.cwd(),
  "uploads/products",
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (
    _req,
    _file,
    cb,
  ) => {
    cb(null, uploadDirectory);
  },

  filename: (
    _req,
    file,
    cb,
  ) => {
    const extension =
      path.extname(file.originalname);

    const filename =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9,
      )}${extension}`;

    cb(null, filename);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (
    _req,
    file,
    cb,
  ) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      allowedTypes.includes(
        file.mimetype,
      )
    ) {
      cb(null, true);
      return;
    }

    cb(
      new Error(
        "Only JPG, PNG, and WebP images are allowed",
      ),
    );
  },
});

router.post(
  "/product",
  requireAuth,
  requireAdmin,
  upload.single("image"),
  uploadProductImage,
);

export default router;