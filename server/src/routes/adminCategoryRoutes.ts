import { Router } from "express";

import {
  requireAuth,
} from "../middleware/authMiddleware";

import {
  requireAdmin,
} from "../middleware/roleMiddleware";

import {
  getAdminCategories,
  createAdminCategory,
} from "../controllers/adminCategoryController";

import {
  updateAdminCategory,
  deleteAdminCategory,
} from "../controllers/adminCategoryManageController";

const router = Router();

router.use(
  requireAuth,
  requireAdmin,
);

router.get(
  "/",
  getAdminCategories,
);

router.post(
  "/",
  createAdminCategory,
);

router.put(
  "/:id",
  updateAdminCategory,
);

router.delete(
  "/:id",
  deleteAdminCategory,
);

export default router;