import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";

import {
  getProductReviews,
  createReview,
} from "../controllers/reviewController";

const router = Router();

router.get(
  "/product/:productId",
  getProductReviews,
);

router.post(
  "/product/:productId",
  requireAuth,
  createReview,
);

export default router;
