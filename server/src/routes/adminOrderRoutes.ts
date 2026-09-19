import { Router } from "express";

import { requireAuth } from "../middleware/authMiddleware";
import { requireAdmin } from "../middleware/roleMiddleware";

import {
  getAdminOrders,
  updateAdminOrderStatus,
  updateAdminShipment,
} from "../controllers/adminOrderController";

import {
  getAdminOrdersQuery,
} from "../controllers/adminOrderQueryController";

const router = Router();
console.log("requireAuth type:", typeof requireAuth);
console.log("requireAdmin type:", typeof requireAdmin);
router.use(requireAuth, requireAdmin);

// Search, filters and pagination
router.get(
  "/query",
  getAdminOrdersQuery,
);

// Existing order list
router.get(
  "/",
  getAdminOrders,
);

// Existing order status update
router.put(
  "/:id/status",
  updateAdminOrderStatus,
);

// Existing shipment/tracking update
router.put(
  "/:id/shipment",
  updateAdminShipment,
);

console.log("ADMIN ORDER ROUTES LOADED");

export default router;