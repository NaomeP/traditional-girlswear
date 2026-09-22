import crypto from "crypto";

import prisma from "../config/prisma.js";
import razorpay from "../config/razorpay.js";


export async function releaseExpiredOnlineOrders() {
  const cutoff = new Date(Date.now() - 30 * 60 * 1000);
  const orders = await prisma.order.findMany({
    where: { paymentMethod: "ONLINE", paymentStatus: { in: ["PENDING", "PROCESSING"] }, status: "PLACED", createdAt: { lt: cutoff } },
    select: { id: true, userId: true },
  });
  for (const order of orders) {
    await abandonOnlineOrder(order.userId, order.id);
  }
  return orders.length;
}export async function createOnlinePaymentOrder(
  orderId: string,
  userId: string,
) {
  await releaseExpiredOnlineOrders();
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      payment: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.paymentMethod !== "ONLINE") {
    throw new Error("Only online orders require payment");
  }

  if (order.paymentStatus === "PAID") {
    throw new Error("Order already paid");
  }

  if (!order.payment) {
    throw new Error("Payment record not found");
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: Number(order.total) * 100,
    currency: "INR",
    receipt: order.orderNumber,
    notes: {
      orderId: order.id,
    },
  });

  await prisma.payment.update({
    where: {
      orderId: order.id,
    },
    data: {
      provider: "RAZORPAY",
      gatewayOrderId: razorpayOrder.id,
      status: "PROCESSING",
    },
  });

  return {
    key: process.env.RAZORPAY_KEY_ID,
    gatewayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    orderId: order.id,
  };
}

export async function verifyOnlinePayment(
  userId: string,
  data: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  },
) {
  await releaseExpiredOnlineOrders();
  const order = await prisma.order.findFirst({
    where: {
      id: data.orderId,
      userId,
    },
    include: {
      payment: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (!order.payment) {
    throw new Error("Payment record not found");
  }

  if (!order.payment.gatewayOrderId) {
    throw new Error("Razorpay order not found");
  }

  if (
    order.payment.gatewayOrderId !==
    data.razorpayOrderId
  ) {
    throw new Error("Razorpay order mismatch");
  }

  if (order.paymentStatus === "PAID") {
    throw new Error("Order already paid");
  }

  const generatedSignature = crypto
    .createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET!,
    )
    .update(
      `${data.razorpayOrderId}|${data.razorpayPaymentId}`,
    )
    .digest("hex");

  if (
    generatedSignature !==
    data.razorpaySignature
  ) {
    throw new Error("Invalid payment signature");
  }

  const updatedPayment = await prisma.$transaction(
    async (tx) => {
      await tx.payment.update({
        where: {
          orderId: order.id,
        },
        data: {
          gatewayPaymentId:
            data.razorpayPaymentId,
          gatewaySignature:
            data.razorpaySignature,
          status: "PAID",
          paidAt: new Date(),
        },
      });

      return tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          paymentStatus: "PAID",
          status: "PAYMENT_CONFIRMED",
        },
        include: {
          payment: true,
        },
      });
    },
  );

  return updatedPayment;
}

export async function handlePaymentWebhook(payload: unknown, rawBody: Buffer, signature?: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !signature) throw new Error("Missing Razorpay webhook signature");
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) throw new Error("Invalid Razorpay webhook signature");
  const event = (payload as { event?: string }).event;
  const gatewayPayment = (payload as { payload?: { payment?: { entity?: { id?: string; order_id?: string } } } }).payload?.payment?.entity;
  if (!gatewayPayment?.order_id) return;
  const existingPayment = await prisma.payment.findFirst({ where: { gatewayOrderId: gatewayPayment.order_id }, include: { order: true } });
  if (!existingPayment) { console.warn(`Payment not found for Razorpay order ID: ${gatewayPayment.order_id}`); return; }
  if (event === "payment.captured") {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({ where: { id: existingPayment.id }, data: { gatewayPaymentId: gatewayPayment.id, status: "PAID", paidAt: new Date() } });
      await tx.order.update({ where: { id: existingPayment.orderId }, data: { paymentStatus: "PAID", status: existingPayment.order.status === "PLACED" ? "PAYMENT_CONFIRMED" : existingPayment.order.status } });
    });
  } else if (event === "payment.failed") {
    await prisma.payment.update({ where: { id: existingPayment.id }, data: { gatewayPaymentId: gatewayPayment.id, status: "FAILED" } });
  }
}

export async function abandonOnlineOrder(userId: string, orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({ where: { id: orderId, userId }, include: { items: true, payment: true } });
    if (!order) throw new Error("Order not found");
    if (order.paymentMethod !== "ONLINE" || order.paymentStatus === "PAID") return order;
    if (order.status !== "CANCELLED") {
      for (const item of order.items) {
        await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
      }
      if (order.couponCode) {
        await tx.coupon.updateMany({ where: { code: order.couponCode, usedCount: { gt: 0 } }, data: { usedCount: { decrement: 1 } } });
      }
    }
    return tx.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED", paymentStatus: "FAILED", payment: { update: { status: "FAILED", failureReason: "Payment cancelled by customer" } } },
    });
  });
}
