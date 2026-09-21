import { Prisma } from "@prisma/client";
import prisma from "../config/prisma";
import type { CreateOrderInput } from "../validators/orderValidator";

function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);

  return `TG-${timestamp}-${random}`;
}

interface CouponCalculation {
  couponCode: string;
  discount: Prisma.Decimal;
}

async function calculateCouponDiscount(
  tx: Prisma.TransactionClient | typeof prisma,
  couponCode: string,
  subtotal: Prisma.Decimal,
): Promise<CouponCalculation> {
  const normalizedCode = couponCode.trim().toUpperCase();

  const coupon = await tx.coupon.findUnique({
    where: {
      code: normalizedCode,
    },
  });

  if (!coupon) {
    throw new Error("Invalid coupon code");
  }

  const now = new Date();

  if (coupon.status !== "ACTIVE") {
    throw new Error("Coupon is not active");
  }

  if (
    now < coupon.startsAt ||
    now > coupon.expiresAt
  ) {
    throw new Error(
      "Coupon has expired or is not active",
    );
  }

  if (
    coupon.minimumOrderValue &&
    subtotal.lessThan(coupon.minimumOrderValue)
  ) {
    throw new Error(
      `Minimum order value is ₹${coupon.minimumOrderValue.toString()}`,
    );
  }

  if (
    coupon.usageLimit !== null &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    throw new Error("Coupon usage limit reached");
  }

  let discount = new Prisma.Decimal(0);

  if (coupon.discountType === "PERCENTAGE") {
    discount = subtotal
      .mul(coupon.discountValue)
      .div(100);
  } else {
    discount = coupon.discountValue;
  }

  if (
    coupon.maximumDiscount &&
    discount.greaterThan(coupon.maximumDiscount)
  ) {
    discount = coupon.maximumDiscount;
  }

  if (discount.greaterThan(subtotal)) {
    discount = subtotal;
  }

  return {
    couponCode: coupon.code,
    discount,
  };
}

export async function applyCoupon(
  couponCode: string,
  items: CreateOrderInput["items"],
) {
  return prisma.$transaction(async (tx) => {
    const variantIds = items.map(
      (item) => item.variantId,
    );

    const variants = await tx.productVariant.findMany({
      where: {
        id: {
          in: variantIds,
        },
      },
      include: {
        product: true,
      },
    });

    if (variants.length !== items.length) {
      throw new Error(
        "One or more selected products are unavailable",
      );
    }

    let subtotal = new Prisma.Decimal(0);

    for (const item of items) {
      const variant = variants.find(
        (currentVariant) =>
          currentVariant.id === item.variantId,
      );

      if (!variant) {
        throw new Error(
          "Selected product variant was not found",
        );
      }

      if (variant.product.status !== "ACTIVE") {
        throw new Error(
          `${variant.product.name} is no longer available`,
        );
      }

      if (variant.stock < item.quantity) {
        throw new Error(
          `Only ${variant.stock} item(s) available for ${variant.product.name}`,
        );
      }

      subtotal = subtotal.add(
        variant.price.mul(item.quantity),
      );
    }

    const {
      couponCode: appliedCouponCode,
      discount,
    } = await calculateCouponDiscount(
      tx,
      couponCode,
      subtotal,
    );

    const shippingSettings = await tx.storeSettings.upsert({
      where: { id: "store" },
      update: {},
      create: {},
    });
    const shippingFee = subtotal.greaterThanOrEqualTo(shippingSettings.freeShippingThreshold)
      ? new Prisma.Decimal(0)
      : shippingSettings.flatShippingFee;

    const total = subtotal
      .sub(discount)
      .add(shippingFee);

    return {
      couponCode: appliedCouponCode,
      subtotal: subtotal.toString(),
      discount: discount.toString(),
      shippingFee: shippingFee.toString(),
      total: total.toString(),
    };
  });
}

export async function createOrder(input: CreateOrderInput) {
  const {
    userId,
    addressId,
    paymentMethod,
    items,
    couponCode,
    notes,
  } = input;

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const address = await tx.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      throw new Error(
        "Delivery address not found for this user",
      );
    }

    const variantIds = items.map(
      (item) => item.variantId,
    );

    const variants = await tx.productVariant.findMany({
      where: {
        id: {
          in: variantIds,
        },
      },
      include: {
        product: true,
      },
    });

    if (variants.length !== items.length) {
      throw new Error(
        "One or more selected products are unavailable",
      );
    }

    let subtotal = new Prisma.Decimal(0);
const orderItems: {
  variantId: string;
  productName: string;
  size: string;
  color: string;
  sku: string;
  quantity: number;
  unitPrice: Prisma.Decimal;
  totalPrice: Prisma.Decimal;
}[] = [];

    for (const item of items) {
      const variant = variants.find(
        (currentVariant) =>
          currentVariant.id === item.variantId,
      );

      if (!variant) {
        throw new Error(
          "Selected product variant was not found",
        );
      }

      if (variant.product.status !== "ACTIVE") {
        throw new Error(
          `${variant.product.name} is no longer available`,
        );
      }

      if (variant.stock < item.quantity) {
        throw new Error(
          `Only ${variant.stock} item(s) available for ${variant.product.name}`,
        );
      }

      const unitPrice = variant.price;
      const totalPrice = unitPrice.mul(item.quantity);

      subtotal = subtotal.add(totalPrice);

      orderItems.push({
        variantId: variant.id,
        productName: variant.product.name,
        size: variant.size,
        color: variant.color,
        sku: variant.sku,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });
    }

    let discount = new Prisma.Decimal(0);
    let appliedCouponCode: string | null = null;

    if (couponCode) {
      const couponResult =
        await calculateCouponDiscount(
          tx,
          couponCode,
          subtotal,
        );

      discount = couponResult.discount;
      appliedCouponCode =
        couponResult.couponCode;

      await tx.coupon.update({
        where: {
          code: appliedCouponCode,
        },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      });
    }

    const shippingSettings = await tx.storeSettings.upsert({
      where: { id: "store" },
      update: {},
      create: {},
    });
    const shippingZone = await tx.shippingZone.findFirst({
      where: { isActive: true, postalCodes: { has: address.postalCode } },
    });
    const shippingFee = subtotal.greaterThanOrEqualTo(shippingSettings.freeShippingThreshold)
      ? new Prisma.Decimal(0)
      : shippingZone?.shippingFee ?? shippingSettings.flatShippingFee;

    const total = subtotal
      .sub(discount)
      .add(shippingFee);

    const order = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        addressId,
        status: "PLACED",
        paymentStatus: "PENDING",
        paymentMethod,
        subtotal,
        discount,
        shippingFee,
        total,
        couponCode: appliedCouponCode,
        notes: notes ?? null,

        items: {
          create: orderItems,
        },

        payment: {
          create: {
            amount: total,
            status: "PENDING",
            method: paymentMethod,
          },
        },

        shipment: {
          create: {
            status: "PENDING",
          },
        },
      },

      include: {
        items: true,
        payment: true,
        shipment: true,
      },
    });

    for (const item of items) {
      const updatedVariant =
        await tx.productVariant.updateMany({
          where: {
            id: item.variantId,
            stock: {
              gte: item.quantity,
            },
          },

          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

      if (updatedVariant.count !== 1) {
        throw new Error(
          "Stock changed while placing the order. Please try again.",
        );
      }
    }

    return order;
  });
}
