import { Router } from "express";

import { requireAuth } from "../middleware/authMiddleware";

import {
  createPaymentController,
  verifyPaymentController,
  paymentWebhookController,
} from "../controllers/paymentController";

const router = Router();

router.post(
  "/create/:orderId",
  requireAuth,
  createPaymentController,
);

router.post(
  "/verify",
  requireAuth,
  verifyPaymentController,
);

router.post(
  "/webhook",
  paymentWebhookController,
);

export default router;