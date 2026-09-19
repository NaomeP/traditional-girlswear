import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../services/wishlistService";

export async function getWishlistController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const wishlist = await getWishlist(userId);

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    console.error("Failed to load wishlist:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load wishlist",
    });
  }
}

export async function addWishlistController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { variantId } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (
      typeof variantId !== "string" ||
      !variantId.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Variant ID is required",
      });
      return;
    }

    const item = await addToWishlist(
      userId,
      variantId,
    );

    res.status(201).json({
      success: true,
      message: "Added to wishlist",
      data: item,
    });
  } catch (error) {
    console.error("Failed to add wishlist item:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to add wishlist item";

    res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function removeWishlistController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user?.userId;
    const variantId = String(req.params.variantId);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    await removeFromWishlist(
      userId,
      variantId,
    );

    res.status(200).json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (error) {
    console.error(
      "Failed to remove wishlist item:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to remove wishlist item";

    res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function clearWishlistController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    await clearWishlist(userId);

    res.status(200).json({
      success: true,
      message: "Wishlist cleared",
    });
  } catch (error) {
    console.error("Failed to clear wishlist:", error);

    res.status(500).json({
      success: false,
      message: "Failed to clear wishlist",
    });
  }
}