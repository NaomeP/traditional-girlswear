import { Request, Response } from "express";
import prisma from "../config/prisma";
export async function getShippingQuote(req: Request, res: Response) {
  try {
    const subtotal = Number(req.query.subtotal);
    const postalCode = typeof req.query.postalCode === "string" ? req.query.postalCode.trim() : "";
    if (!Number.isFinite(subtotal) || subtotal < 0) return res.status(400).json({ success: false, message: "Valid subtotal is required" });
    const settings = await prisma.storeSettings.upsert({ where: { id: "store" }, update: {}, create: {} });
    const zone = postalCode ? await prisma.shippingZone.findFirst({ where: { isActive: true, postalCodes: { has: postalCode } } }) : null;
    const shippingFee = subtotal >= Number(settings.freeShippingThreshold) ? 0 : Number(zone?.shippingFee ?? settings.flatShippingFee);
    res.json({ success: true, data: { shippingFee, deliveryDays: zone?.deliveryDays ?? settings.standardDeliveryDays, freeShippingThreshold: Number(settings.freeShippingThreshold) } });
  } catch { res.status(500).json({ success: false, message: "Unable to calculate shipping" }); }
}
