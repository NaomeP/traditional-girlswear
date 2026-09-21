import { Request, Response } from "express";
import prisma from "../config/prisma";

const ORDER_STATUSES = [
  "PLACED",
  "PAYMENT_CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
  "REFUNDED",
] as const;

const SHIPMENT_STATUSES = [
  "PENDING",
  "SHIPPED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "RETURNED",
] as const;

function orderInclude() {
  return {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
      },
    },

    address: true,

    items: {
      orderBy: {
        createdAt: "asc" as const,
      },

      include: {
        variant: {
          select: {
            id: true,
            size: true,
            color: true,
            sku: true,
            price: true,
            stock: true,
          },
        },
      },
    },

    payment: true,
    shipment: true,
  };
}

// GET ALL CUSTOMER ORDERS
export async function getAdminOrders(
  _req: Request,
  res: Response,
) {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: orderInclude(),
    });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get admin orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load customer orders",
    });
  }
}

// UPDATE ORDER STATUS
export async function updateAdminOrderStatus(
  req: Request,
  res: Response,
) {
  try {
   const id = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;
    const { status } = req.body;

    if (
      !id ||
      typeof status !== "string" ||
      !ORDER_STATUSES.includes(
        status as (typeof ORDER_STATUSES)[number],
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const existingOrder = await prisma.order.findUnique({
      where: {
        id,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id,
      },

      data: {
        status: status as (typeof ORDER_STATUSES)[number],
      },

      include: orderInclude(),
    });

    return res.status(200).json({
      success: true,
      data: updatedOrder,
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
}

// UPDATE SHIPPING AND TRACKING DETAILS
// UPDATE SHIPPING AND TRACKING DETAILS
export async function updateAdminShipment(
  req: Request,
  res: Response,
) {
  try {
    const id = String(req.params.id);

    const {
      courierName,
      trackingNumber,
      trackingUrl,
      status,
      shippedAt,
      deliveredAt,
    } = req.body;

    if (!id || id === "undefined") {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    if (
      status !== undefined &&
      (
        typeof status !== "string" ||
        !SHIPMENT_STATUSES.includes(
          status as (typeof SHIPMENT_STATUSES)[number],
        )
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipment status",
      });
    }

    const order = await prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        shipment: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const shipmentStatus =
      status ?? order.shipment?.status ?? "PENDING";

    const shipmentData = {
      courierName:
        courierName === undefined
          ? order.shipment?.courierName ?? null
          : courierName || null,

      trackingNumber:
        trackingNumber === undefined
          ? order.shipment?.trackingNumber ?? null
          : trackingNumber || null,

      trackingUrl:
        trackingUrl === undefined
          ? order.shipment?.trackingUrl ?? null
          : trackingUrl || null,

      status: shipmentStatus as (typeof SHIPMENT_STATUSES)[number],

      shippedAt:
        shippedAt !== undefined
          ? shippedAt
            ? new Date(shippedAt)
            : null
          : order.shipment?.shippedAt ?? null,

      deliveredAt:
        deliveredAt !== undefined
          ? deliveredAt
            ? new Date(deliveredAt)
            : null
          : order.shipment?.deliveredAt ?? null,
    };

    const updatedOrder = await prisma.order.update({
      where: {
        id,
      },

      data: {
        shipment: {
          upsert: {
            create: shipmentData,
            update: shipmentData,
          },
        },
      },

      include: orderInclude(),
    });

    return res.status(200).json({
      success: true,
      data: updatedOrder,
      message: "Shipping details updated successfully",
    });
  } catch (error) {
    console.error("Update shipment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update shipping details",
    });
  }
}export async function getAdminOrderInvoice(req: Request, res: Response): Promise<void> {
  try {
    const order = await prisma.order.findUnique({ where: { id: String(req.params.id) }, include: { user: true, address: true, items: true, payment: true, shipment: true } });
    if (!order) { res.status(404).json({ success: false, message: "Order not found" }); return; }
    const escape = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[char] ?? char);
    const rows = order.items.map((item) => `<tr><td>${escape(item.productName)}<br><small>${escape(item.size)} · ${escape(item.color)} · ${escape(item.sku)}</small></td><td>${item.quantity}</td><td>₹${Number(item.unitPrice).toFixed(2)}</td><td>₹${Number(item.totalPrice).toFixed(2)}</td></tr>`).join("");
    res.type("html").send(`<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${escape(order.orderNumber)}</title><style>body{font-family:Arial,sans-serif;max-width:760px;margin:40px auto;color:#17130e}header{display:flex;justify-content:space-between;border-bottom:2px solid #c9a227;padding-bottom:20px}table{width:100%;border-collapse:collapse;margin:28px 0}th,td{text-align:left;padding:12px;border-bottom:1px solid #ddd}small{color:#666}.total{margin-left:auto;width:260px}.total p{display:flex;justify-content:space-between}@media print{body{margin:20px}}</style></head><body><header><div><h1>NILA Girlswear</h1><p>Tax invoice</p></div><div><strong>${escape(order.orderNumber)}</strong><br>${escape(order.createdAt.toLocaleDateString("en-IN"))}</div></header><h3>Bill to</h3><p><strong>${escape(order.address.fullName)}</strong><br>${escape(order.address.addressLine1)} ${escape(order.address.addressLine2)}<br>${escape(order.address.city)}, ${escape(order.address.state)} – ${escape(order.address.postalCode)}<br>${escape(order.address.mobile)}<br>${escape(order.user.email)}</p><table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><div class="total"><p><span>Subtotal</span><span>₹${Number(order.subtotal).toFixed(2)}</span></p><p><span>Discount</span><span>−₹${Number(order.discount).toFixed(2)}</span></p><p><span>Shipping</span><span>₹${Number(order.shippingFee).toFixed(2)}</span></p><p><strong>Grand total</strong><strong>₹${Number(order.total).toFixed(2)}</strong></p></div><p>Payment: ${escape(order.payment?.status ?? order.paymentStatus)} · ${escape(order.paymentMethod)}</p><script>window.onload=()=>window.print()</script></body></html>`);
  } catch (error) { console.error("Failed to generate invoice:", error); res.status(500).json({ success: false, message: "Failed to generate invoice" }); }
}
