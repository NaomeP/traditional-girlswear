import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { requireAdmin } from "../middleware/roleMiddleware";
import { deleteReview, getAdminReviews, updateReviewStatus } from "../controllers/adminReviewController";

const router = Router();
router.use(requireAuth, requireAdmin);
router.get("/", getAdminReviews);
router.put("/:id/status", updateReviewStatus);
router.delete("/:id", deleteReview);
export default router;
