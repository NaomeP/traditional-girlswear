import { Request, Response } from "express";
import prisma from "../config/prisma";

// Get reviews for a product
export async function getProductReviews(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const productIdParam = req.params.productId;

    const productId = Array.isArray(productIdParam)
      ? productIdParam[0]
      : productIdParam;

    if (!productId) {
      res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
      return;
    }

    const reviews = await prisma.review.findMany({
      where: {
        productId: productId,
      },
      include: {
        replies: {
          include: {
            admin: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          totalReviews
        : 0;

    const ratingBreakdown = {
      5: reviews.filter((review) => review.rating === 5).length,
      4: reviews.filter((review) => review.rating === 4).length,
      3: reviews.filter((review) => review.rating === 3).length,
      2: reviews.filter((review) => review.rating === 2).length,
      1: reviews.filter((review) => review.rating === 1).length,
    };

    res.status(200).json({
      success: true,
      data: {
        reviews,
        summary: {
          totalReviews,
          averageRating: Number(averageRating.toFixed(1)),
          ratingBreakdown,
        },
      },
    });
  } catch (error) {
    console.error("Failed to load reviews:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load reviews",
    });
  }
}

// Create a review
export async function createReview(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const productIdParam = req.params.productId;

    const productId = Array.isArray(productIdParam)
      ? productIdParam[0]
      : productIdParam;

    if (!productId) {
      res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
      return;
    }

    const { rating, comment, guestName } = req.body;

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
      return;
    }

    if (
      typeof comment !== "string" ||
      comment.trim().length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "Review comment is required",
      });
      return;
    }

    if (
      typeof guestName !== "string" ||
      guestName.trim().length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "Name is required",
      });
      return;
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        status: "ACTIVE",
      },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    const review = await prisma.review.create({
      data: {
        productId: productId,
        rating,
        comment: comment.trim(),
        guestName: guestName.trim(),
      },
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error) {
    console.error("Failed to create review:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit review",
    });
  }
}