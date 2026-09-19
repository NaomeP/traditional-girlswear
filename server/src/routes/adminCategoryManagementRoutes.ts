import { Router } from "express";

import {
  requireAuth,
} from "../middleware/authMiddleware";

import {
  requireAdmin,
} from "../middleware/roleMiddleware";
import * as categoryController from "../controllers/adminCategoryManageController";

const router = Router();

router.use(
  requireAuth,
  requireAdmin,
);

router.put(
  "/:id",
  categoryController.updateAdminCategory,
);

router.delete(
  "/:id",
  categoryController.deleteAdminCategory,
);
export default router;