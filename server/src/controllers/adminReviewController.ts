import { Request, Response } from "express";
import prisma from "../config/prisma";

export async function getAdminReviews(_req: Request, res: Response): Promise<void> {
  try {
    const reviews = await prisma.review.findMany({ include: { product: { select: { id: true, name: true, slug: true } } }, orderBy: { createdAt: "desc" } });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load reviews" });
  }
}

export async function updateReviewStatus(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status } = req.body;
    if (!id || !["PENDING", "APPROVED", "HIDDEN"].includes(status)) {
      res.status(400).json({ success: false, message: "Invalid review status" });
      return;
    }
    const review = await prisma.review.update({ where: { id }, data: { status }, include: { product: { select: { id: true, name: true, slug: true } } } });
    res.json({ success: true, data: review });
  } catch (error) {
    res.status(404).json({ success: false, message: "Review not found" });
  }
}

export async function deleteReview(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      res.status(400).json({ success: false, message: "Review ID is required" });
      return;
    }
    await prisma.review.delete({ where: { id } });
    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    res.status(404).json({ success: false, message: "Review not found" });
  }
}
