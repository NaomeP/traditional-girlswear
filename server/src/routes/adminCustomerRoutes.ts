import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { requireAdmin } from "../middleware/roleMiddleware";
import { getAdminCustomer, getAdminCustomers } from "../controllers/adminCustomerController";

const router = Router();
router.use(requireAuth, requireAdmin);
router.get("/", getAdminCustomers);
router.get("/:id", getAdminCustomer);
export default router;
