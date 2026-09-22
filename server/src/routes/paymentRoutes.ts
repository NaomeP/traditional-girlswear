import { Router } from "express";

import { requireAuth } from "../middleware/authMiddleware";

import {
  createPaymentController,
  verifyPaymentController,
  paymentWebhookController,
  abandonPaymentController,
} from "../controllers/paymentController";

const router = Router();

router.post(
  "/create/:orderId",
  requireAuth,
  createPaymentController,
);

router.post("/abandon/:orderId", requireAuth, abandonPaymentController);

router.post(
  "/verify",
  requireAuth,
  verifyPaymentController,
);

router.post(
  "/webhook",
  paymentWebhookController,
  abandonPaymentController,
);

export default router;
