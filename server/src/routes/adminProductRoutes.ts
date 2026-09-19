import { Router } from "express";

import {
  requireAuth,
} from "../middleware/authMiddleware";

import {
  requireAdmin,
} from "../middleware/roleMiddleware";

import {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
} from "../controllers/adminProductController";

const router = Router();

router.use(
  requireAuth,
  requireAdmin,
);

router.get(
  "/",
  getAdminProducts,
);

router.post(
  "/",
  createAdminProduct,
);

router.put(
  "/:id",
  updateAdminProduct,
);

router.delete(
  "/:id",
  deleteAdminProduct,
);

export default router;