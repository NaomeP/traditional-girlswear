import { Request, Response } from "express";
import prisma from "../config/prisma";

type Activity = {
  type: "ORDER_PLACED" | "ORDER_CANCELLED" | "RETURN_REQUESTED" | "REFUND_COMPLETED";
  title: string;
  details: string;
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  amount: number;
  occurredAt: Date;
};

/** GET /admin/dashboard/activity */
export async function getAdminRecentActivity(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const [orders, returns] = await Promise.all([
      prisma.order.findMany({
        take: 50,
        orderBy: { updatedAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: { select: { productName: true, quantity: true } },
        },
      }),
      prisma.returnRequest.findMany({
        take: 50,
        orderBy: { updatedAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          order: { select: { orderNumber: true, total: true } },
        },
      }),
    ]);

    const activities: Activity[] = orders.flatMap((order) => {
      const products = order.items
        .map((item) => `${item.productName} ×${item.quantity}`)
        .join(", ");
      const base = {
        customerName: order.user.name,
        customerEmail: order.user.email,
        orderNumber: order.orderNumber,
        amount: Number(order.total),
      };
      const items: Activity[] = [{
        ...base,
        type: "ORDER_PLACED",
        title: "New order placed",
        details: products || "Order placed",
        occurredAt: order.createdAt,
      }];

      if (order.status === "CANCELLED") {
        items.push({
          ...base,
          type: "ORDER_CANCELLED",
          title: "Order cancelled by customer",
          details: "Customer cancelled this order.",
          occurredAt: order.updatedAt,
        });
      }

      if (order.status === "REFUNDED") {
        items.push({
          ...base,
          type: "REFUND_COMPLETED",
          title: "Refund completed",
          details: "Refund was completed for this order.",
          occurredAt: order.updatedAt,
        });
      }

      return items;
    });

    for (const request of returns) {
      const base = {
        customerName: request.user.name,
        customerEmail: request.user.email,
        orderNumber: request.order.orderNumber,
        amount: Number(request.refundAmount ?? request.order.total),
      };

      activities.push({
        ...base,
        type: "RETURN_REQUESTED",
        title: "New return request",
        details: `Reason: ${request.reason.replaceAll("_", " ")}`,
        occurredAt: request.requestedAt,
      });

      if (request.status === "REFUNDED" && request.refundedAt) {
        activities.push({
          ...base,
          type: "REFUND_COMPLETED",
          title: "Refund completed",
          details: "Refund was completed for this return request.",
          occurredAt: request.refundedAt,
        });
      }
    }

    activities.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

    res.status(200).json({
      success: true,
      data: activities.slice(0, 30).map((activity) => ({
        ...activity,
        occurredAt: activity.occurredAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Failed to load admin activity:", error);
    res.status(500).json({ success: false, message: "Failed to load recent activity" });
  }
}

