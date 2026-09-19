import type { Request, Response } from "express";

import prisma from "../config/prisma";

const COUPON_CODE_PATTERN = /^[A-Z0-9_-]+$/;

function normalizeCouponCode(code: unknown): string {
  return typeof code === "string"
    ? code.trim().toUpperCase()
    : "";
}

function isValidDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    !Number.isNaN(new Date(value).getTime())
  );
}

export async function getAdminCoupons(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    console.error(
      "Failed to fetch admin coupons:",
      error,
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
    });
  }
}

export async function createAdminCoupon(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const {
      code,
      discountType,
      discountValue,
      minimumOrderValue,
      maximumDiscount,
      usageLimit,
      startsAt,
      expiresAt,
      status,
    } = req.body;

    const normalizedCode =
      normalizeCouponCode(code);

    if (
      !normalizedCode ||
      !COUPON_CODE_PATTERN.test(normalizedCode)
    ) {
      res.status(400).json({
        success: false,
        message:
          "Coupon code must contain only letters, numbers, hyphens, or underscores",
      });

      return;
    }

    if (
      discountType !== "PERCENTAGE" &&
      discountType !== "FIXED"
    ) {
      res.status(400).json({
        success: false,
        message:
          "Discount type must be PERCENTAGE or FIXED",
      });

      return;
    }

    if (
      typeof discountValue !== "number" ||
      !Number.isFinite(discountValue) ||
      discountValue <= 0
    ) {
      res.status(400).json({
        success: false,
        message:
          "Discount value must be greater than 0",
      });

      return;
    }

    if (
      discountType === "PERCENTAGE" &&
      discountValue > 100
    ) {
      res.status(400).json({
        success: false,
        message:
          "Percentage discount cannot exceed 100",
      });

      return;
    }

    if (
      minimumOrderValue !== undefined &&
      minimumOrderValue !== null &&
      (
        typeof minimumOrderValue !== "number" ||
        !Number.isFinite(minimumOrderValue) ||
        minimumOrderValue < 0
      )
    ) {
      res.status(400).json({
        success: false,
        message:
          "Minimum order value must be a non-negative number",
      });

      return;
    }

    if (
      maximumDiscount !== undefined &&
      maximumDiscount !== null &&
      (
        typeof maximumDiscount !== "number" ||
        !Number.isFinite(maximumDiscount) ||
        maximumDiscount <= 0
      )
    ) {
      res.status(400).json({
        success: false,
        message:
          "Maximum discount must be greater than 0",
      });

      return;
    }

    if (
      usageLimit !== undefined &&
      usageLimit !== null &&
      (
        typeof usageLimit !== "number" ||
        !Number.isInteger(usageLimit) ||
        usageLimit <= 0
      )
    ) {
      res.status(400).json({
        success: false,
        message:
          "Usage limit must be a positive integer",
      });

      return;
    }

    if (!isValidDate(startsAt)) {
      res.status(400).json({
        success: false,
        message: "Valid start date is required",
      });

      return;
    }

    if (!isValidDate(expiresAt)) {
      res.status(400).json({
        success: false,
        message: "Valid expiry date is required",
      });

      return;
    }

    const startDate = new Date(startsAt);
    const expiryDate = new Date(expiresAt);

    if (expiryDate <= startDate) {
      res.status(400).json({
        success: false,
        message:
          "Expiry date must be later than start date",
      });

      return;
    }

    if (
      discountType === "FIXED" &&
      maximumDiscount !== undefined &&
      maximumDiscount !== null
    ) {
      res.status(400).json({
        success: false,
        message:
          "Maximum discount should not be used with a fixed discount",
      });

      return;
    }

    const existingCoupon =
      await prisma.coupon.findUnique({
        where: {
          code: normalizedCode,
        },
      });

    if (existingCoupon) {
      res.status(409).json({
        success: false,
        message: "Coupon code already exists",
      });

      return;
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: normalizedCode,
        discountType,
        discountValue,
        minimumOrderValue:
          minimumOrderValue ?? null,
        maximumDiscount:
          maximumDiscount ?? null,
        usageLimit: usageLimit ?? null,
        startsAt: startDate,
        expiresAt: expiryDate,
        status:
          status === "INACTIVE"
            ? "INACTIVE"
            : "ACTIVE",
      },
    });

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon,
    });
  } catch (error) {
    console.error(
      "Failed to create admin coupon:",
      error,
    );

    res.status(500).json({
      success: false,
      message: "Failed to create coupon",
    });
  }
}