import { Router } from "express";
import prisma from "../config/prisma";

const router = Router();
router.get("/", async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
    res.json({ success: true, data: categories });
  } catch { res.status(500).json({ success: false, message: "Failed to load collections" }); }
});
export default router;
