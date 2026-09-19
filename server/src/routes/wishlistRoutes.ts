import { Router } from "express";

import { requireAuth } from "../middleware/authMiddleware";

import {
  getWishlistController,
  addWishlistController,
  removeWishlistController,
  clearWishlistController,
} from "../controllers/wishlistController";

const router = Router();

router.get(
  "/",
  requireAuth,
  getWishlistController,
);

router.post(
  "/",
  requireAuth,
  addWishlistController,
);

router.delete(
  "/:variantId",
  requireAuth,
  removeWishlistController,
);

router.delete(
  "/",
  requireAuth,
  clearWishlistController,
);

export default router;