import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { requireAdmin } from "../middleware/roleMiddleware";
import { getHomePageContent, updateHomePageContent } from "../controllers/homePageController";
const router = Router(); router.use(requireAuth, requireAdmin); router.get("/", getHomePageContent); router.put("/", updateHomePageContent); export default router;
