import { Router } from "express";
import {
  getAdminReturnsController,
  getAdminReturnByIdController,
  updateAdminReturnStatusController,
} from "../controllers/adminReturnController";
import { requireAuth } from "../middleware/authMiddleware";
import { requireAdmin } from "../middleware/roleMiddleware";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", getAdminReturnsController);

router.get("/:id", getAdminReturnByIdController);

router.put(
  "/:id/status",
  updateAdminReturnStatusController,
);

export default router;