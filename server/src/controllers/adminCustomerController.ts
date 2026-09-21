import { Request, Response } from "express";
import prisma from "../config/prisma";

const customerSelect = {
  id: true,
  name: true,
  email: true,
  mobile: true,
  createdAt: true,
  addresses: { orderBy: { updatedAt: "desc" as const } },
  orders: {
    orderBy: { createdAt: "desc" as const },
    select: { id: true, orderNumber: true, status: true, total: true, createdAt: true },
  },
};

function toCustomer(user: Awaited<ReturnType<typeof prisma.user.findMany>>[number] & { addresses: unknown[]; orders: { total: unknown; createdAt: Date }[] }) {
  const orders = user.orders;
  return {
    ...user,
    totalOrders: orders.length,
    totalSpend: orders.reduce((sum, order) => sum + Number(order.total), 0),
    lastOrderAt: orders[0]?.createdAt ?? null,
  };
}

export async function getAdminCustomers(_req: Request, res: Response): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
      include: customerSelect,
    });
    res.status(200).json({ success: true, data: users.map((user) => toCustomer(user as never)) });
  } catch (error) {
    console.error("Failed to load customers:", error);
    res.status(500).json({ success: false, message: "Failed to load customers" });
  }
}

export async function getAdminCustomer(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const user = await prisma.user.findFirst({
      where: { id, role: "CUSTOMER" },
      include: {
        ...customerSelect,
        orders: {
          orderBy: { createdAt: "desc" },
          include: { address: true, items: true, payment: true, shipment: true },
        },
      },
    });
    if (!user) {
      res.status(404).json({ success: false, message: "Customer not found" });
      return;
    }
    const orders = user.orders;
    res.status(200).json({ success: true, data: { ...user, totalOrders: orders.length, totalSpend: orders.reduce((sum, order) => sum + Number(order.total), 0), lastOrderAt: orders[0]?.createdAt ?? null } });
  } catch (error) {
    console.error("Failed to load customer:", error);
    res.status(500).json({ success: false, message: "Failed to load customer" });
  }
}
