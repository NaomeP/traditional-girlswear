import { Router } from "express";

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
  createReview,
);

export default router;