import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { requireAdmin } from "../middleware/roleMiddleware";
import { getShippingSettings, updateShippingSettings } from "../controllers/adminShippingController";
const router = Router(); router.use(requireAuth, requireAdmin); router.get("/", getShippingSettings); router.put("/", updateShippingSettings); export default router;
