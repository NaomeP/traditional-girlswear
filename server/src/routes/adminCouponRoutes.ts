import { Router } from "express";

import {
  requireAuth,
} from "../middleware/authMiddleware";

import {
  requireAdmin,
} from "../middleware/roleMiddleware";

import {
  getAdminCoupons,
  createAdminCoupon,
} from "../controllers/adminCouponController";

const router = Router();

router.use(
  requireAuth,
  requireAdmin,
);

router.get(
  "/",
  getAdminCoupons,
);

router.post(
  "/",
  createAdminCoupon,
);

export default router;