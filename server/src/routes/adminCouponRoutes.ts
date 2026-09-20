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
  updateAdminCoupon,
  deleteAdminCoupon,
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

router.put("/:id", updateAdminCoupon);
router.delete("/:id", deleteAdminCoupon);

export default router;
