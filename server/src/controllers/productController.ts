import { Request, Response } from "express";
import prisma from "../config/prisma";
import {
  normalizeProductImages,
} from "../utils/imageUrl";

export async function getProducts(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        variants: {
          orderBy: {
            size: "asc",
          },
        },
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: products.map(normalizeProductImages),
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
}

export async function getProductBySlug(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const slug = req.params.slug;

    if (typeof slug !== "string" || slug.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "Product slug is required",
      });

      return;
    }

    const product = await prisma.product.findUnique({
      where: {
        slug,
      },
      include: {
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        variants: {
          orderBy: {
            size: "asc",
          },
        },
        category: true,
      },
    });

    if (!product || product.status !== "ACTIVE") {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: normalizeProductImages(product),
    });
  } catch (error) {
    console.error("Failed to fetch product:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
}
