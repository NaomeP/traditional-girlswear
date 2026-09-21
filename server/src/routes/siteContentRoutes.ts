import { Router } from "express"; import { getSiteContent, updateSiteContent } from "../controllers/siteContentController"; import { requireAuth } from "../middleware/authMiddleware"; import { requireAdmin } from "../middleware/roleMiddleware";
const router = Router(); router.get("/:key", getSiteContent); router.put("/:key", requireAuth, requireAdmin, updateSiteContent); export default router;
