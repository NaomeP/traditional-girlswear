import { Router } from "express";
import { getAdminRecentActivity } from "../controllers/adminActivityController";

import {
  requireAuth,
} from "../middleware/authMiddleware";

import {
  requireAdmin,
} from "../middleware/roleMiddleware";

import {
  getAdminDashboardSummary,
  getAdminDashboardRevenue,
  getAdminDashboardOrderStats,
  getAdminDashboardCategorySales,
  getAdminDashboardBestSellers,
} from "../controllers/adminDashboardController";

const router = Router();

router.use(
  requireAuth,
  requireAdmin,
);

router.get(
  "/summary",
  getAdminDashboardSummary,
);

router.get(
  "/revenue",
  getAdminDashboardRevenue,
);

router.get(
  "/orders",
  getAdminDashboardOrderStats,
);

router.get(
  "/categories",
  getAdminDashboardCategorySales,
);

router.get(
  "/best-sellers",
  getAdminDashboardBestSellers,
);

router.get("/activity", getAdminRecentActivity);

export default router;

