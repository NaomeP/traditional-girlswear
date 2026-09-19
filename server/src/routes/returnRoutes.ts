import { Router } from "express";

import { requireAuth } from "../middleware/authMiddleware";

import {
  getMyReturnsController,
  getMyReturnByIdController,
  createReturnRequestController,
  cancelMyReturnController,
} from "../controllers/returnController";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  getMyReturnsController,
);

router.get(
  "/:id",
  getMyReturnByIdController,
);

router.post(
  "/",
  createReturnRequestController,
);

router.patch(
  "/:id/cancel",
  cancelMyReturnController,
);

export default router;