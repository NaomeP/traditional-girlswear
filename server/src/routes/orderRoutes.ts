
import { Router } from "express";

import { requireAuth } from "../middleware/authMiddleware";

import {
  createOrderController,
  applyCouponController,
  getMyOrdersController,
  getOrderByIdController,
  cancelOrderController,
} from "../controllers/orderController";

const router = Router();

router.get(
  "/",
  requireAuth,
  getMyOrdersController,
);

router.get(
  "/:id",
  requireAuth,
  getOrderByIdController,
);

router.post(
  "/apply-coupon",
  requireAuth,
  applyCouponController,
);

router.post(
  "/",
  requireAuth,
  createOrderController,
);

router.patch(
  "/:id/cancel",
  requireAuth,
  cancelOrderController,
);


export default router;