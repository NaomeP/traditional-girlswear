
import { Response } from "express";

import {
  AuthenticatedRequest,
} from "../middleware/authMiddleware";

import prisma from "../config/prisma";

import {
  applyCoupon,
  createOrder,
} from "../services/orderService";

import {
  createOrderSchema,
} from "../validators/orderValidator";

export async function createOrderController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const validation = createOrderSchema.safeParse({
      ...req.body,
      userId: req.user.userId,
    });

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid order data",
        errors:
          validation.error.flatten().fieldErrors,
        received: req.body,
      });
      return;
    }

    const order = await createOrder(
      validation.data,
    );

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error(
      "Failed to create order:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create order";

    res.status(400).json({
      success: false,
      message,
    });
  }
}


export async function applyCouponController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { couponCode, items } = req.body;

    if (
      typeof couponCode !== "string" ||
      couponCode.trim().length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: "At least one product is required",
      });
      return;
    }

    for (const item of items) {
      if (
        !item ||
        typeof item.variantId !== "string" ||
        item.variantId.trim().length === 0 ||
        typeof item.quantity !== "number" ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0 ||
        item.quantity > 20
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid product item",
        });
        return;
      }
    }

    const result = await applyCoupon(
      couponCode,
      items,
    );

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "Failed to apply coupon:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to apply coupon";

    res.status(400).json({
      success: false,
      message,
    });
  }
}
export async function getMyOrdersController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: req.user.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: true,
        payment: true,
        shipment: true,
      },
    });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error(
      "Failed to load orders:",
      error,
    );

    res.status(500).json({
      success: false,
      message: "Failed to load orders",
    });
  }
}

export async function getOrderByIdController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const order = await prisma.order.findFirst({
      where: {
        id: String(req.params.id),
        userId: req.user.userId,
      },
      include: {
        items: true,
        payment: true,
        shipment: true,
        address: true,
      },
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error(
      "Failed to load order:",
      error,
    );

    res.status(500).json({
      success: false,
      message: "Failed to load order",
    });
  }
}

export async function cancelOrderController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const orderId = String(req.params.id);

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: req.user.userId,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    const cancellableStatuses = [
      "PLACED",
      "PAYMENT_CONFIRMED",
      "PROCESSING",
    ];

    if (!cancellableStatuses.includes(order.status)) {
      res.status(400).json({
        success: false,
        message:
          "This order can no longer be cancelled.",
      });
      return;
    }

    const cancelledOrder =
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.productVariant.update({
            where: {
              id: item.variantId,
            },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }

        return tx.order.update({
          where: {
            id: order.id,
          },
          data: {
            status: "CANCELLED",
          },
          include: {
            items: true,
            payment: true,
            shipment: true,
            address: true,
          },
        });
      });

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: cancelledOrder,
    });
  } catch (error) {
    console.error(
      "Failed to cancel order:",
      error,
    );

    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
    });
  }
}

