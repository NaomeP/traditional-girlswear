import { Request, Response } from "express";
import prisma from "../config/prisma";

const DASHBOARD_ORDER_STATUSES = [
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

const PAYMENT_STATUSES = [
  "PENDING",
  "PROCESSING",
  "PAID",
  "FAILED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
] as const;

type DashboardOrderStatus =
  (typeof DASHBOARD_ORDER_STATUSES)[number];

type DashboardPaymentStatus =
  (typeof PAYMENT_STATUSES)[number];

function getDateRange(req: Request): {
  fromDate?: Date;
  toDate?: Date;
} {
  const from =
    typeof req.query.from === "string"
      ? req.query.from
      : undefined;

  const to =
    typeof req.query.to === "string"
      ? req.query.to
      : undefined;

  let fromDate: Date | undefined;
  let toDate: Date | undefined;

  if (from) {
    fromDate = new Date(`${from}T00:00:00.000Z`);

    if (Number.isNaN(fromDate.getTime())) {
      throw new Error("Invalid from date");
    }
  }

  if (to) {
    toDate = new Date(`${to}T23:59:59.999Z`);

    if (Number.isNaN(toDate.getTime())) {
      throw new Error("Invalid to date");
    }
  }

  if (fromDate && toDate && fromDate > toDate) {
    throw new Error("From date cannot be after to date");
  }

  return {
    fromDate,
    toDate,
  };
}

function getOrderDateWhere(
  fromDate?: Date,
  toDate?: Date,
) {
  if (!fromDate && !toDate) {
    return {};
  }

  return {
    createdAt: {
      ...(fromDate ? { gte: fromDate } : {}),
      ...(toDate ? { lte: toDate } : {}),
    },
  };
}

function decimalToNumber(value: unknown): number {
  return Number(value ?? 0);
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getMonthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(
    date.getUTCMonth() + 1,
  ).padStart(2, "0")}`;
}

/**
 * GET /admin/dashboard/summary
 */
export async function getAdminDashboardSummary(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { fromDate, toDate } = getDateRange(req);

    const orderDateWhere = getOrderDateWhere(
      fromDate,
      toDate,
    );

    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      cancelledOrders,
      returnedOrders,
      refundedOrders,
      totalCustomers,
      totalProducts,
      revenueOrders,
      refundedOrderValue,
    ] = await Promise.all([
      prisma.order.count({
        where: orderDateWhere,
      }),

      prisma.order.count({
        where: {
          ...orderDateWhere,
          status: "PLACED",
        },
      }),

      prisma.order.count({
        where: {
          ...orderDateWhere,
          status: {
            in: [
              "PROCESSING",
              "PACKED",
              "SHIPPED",
              "OUT_FOR_DELIVERY",
            ],
          },
        },
      }),

      prisma.order.count({
        where: {
          ...orderDateWhere,
          status: "DELIVERED",
        },
      }),

      prisma.order.count({
        where: {
          ...orderDateWhere,
          status: "CANCELLED",
        },
      }),

      prisma.order.count({
        where: {
          ...orderDateWhere,
          status: "RETURNED",
        },
      }),

      prisma.order.count({
        where: {
          ...orderDateWhere,
          status: "REFUNDED",
        },
      }),

      prisma.user.count({
        where: {
          role: "CUSTOMER",
        },
      }),

      prisma.product.count(),

      prisma.order.findMany({
        where: {
          ...orderDateWhere,
          paymentStatus: "PAID",
        },
        select: {
          total: true,
        },
      }),

      prisma.order.findMany({
        where: {
          ...orderDateWhere,
          paymentStatus: "REFUNDED",
        },
        select: {
          total: true,
        },
      }),
    ]);

    const totalRevenue = revenueOrders.reduce(
      (sum, order) =>
        sum + decimalToNumber(order.total),
      0,
    );

    const refundedValue = refundedOrderValue.reduce(
      (sum, order) =>
        sum + decimalToNumber(order.total),
      0,
    );

    /*
     * The frontend AdminDashboardSummary type expects
     * the order counters at the top level.
     *
     * The current database does not contain a separate
     * refund transaction amount, so refundAmount remains null.
     */
    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,

        pendingOrders,
        processingOrders,
        deliveredOrders,
        cancelledOrders,
        returnedOrders,
        refundedOrders,

        refundAmount: null,

        /*
         * This is the value of orders whose payment status
         * is REFUNDED. It is not a separate refund transaction
         * amount.
         */
        refundedOrderValue: refundedValue,
      },
    });
  } catch (error) {
    console.error(
      "Failed to load admin dashboard summary:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to load dashboard summary";

    res.status(400).json({
      success: false,
      message,
    });
  }
}

/**
 * GET /admin/dashboard/revenue
 */
export async function getAdminDashboardRevenue(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { fromDate, toDate } = getDateRange(req);

    const orders = await prisma.order.findMany({
      where: {
        ...getOrderDateWhere(
          fromDate,
          toDate,
        ),
        paymentStatus: "PAID",
      },
      select: {
        total: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const revenueMap = new Map<
      string,
      number
    >();

    for (const order of orders) {
      const date = formatDate(order.createdAt);

      revenueMap.set(
        date,
        (revenueMap.get(date) ?? 0) +
          decimalToNumber(order.total),
      );
    }

    const data = Array.from(
      revenueMap.entries(),
    ).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Failed to load admin dashboard revenue:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to load revenue";

    res.status(400).json({
      success: false,
      message,
    });
  }
}

/**
 * GET /admin/dashboard/orders
 *
 * Returns the shape expected by the dashboard frontend:
 *
 * {
 *   statusCounts,
 *   paymentCounts,
 *   monthly
 * }
 */
export async function getAdminDashboardOrderStats(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { fromDate, toDate } = getDateRange(req);

    const orders = await prisma.order.findMany({
      where: getOrderDateWhere(
        fromDate,
        toDate,
      ),
      select: {
        status: true,
        paymentStatus: true,
        total: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const statusCounts =
      DASHBOARD_ORDER_STATUSES.reduce(
        (result, status) => {
          result[status] = 0;

          return result;
        },
        {} as Record<
          DashboardOrderStatus,
          number
        >,
      );

    const paymentCounts =
      PAYMENT_STATUSES.reduce(
        (result, status) => {
          result[status] = 0;

          return result;
        },
        {} as Record<
          DashboardPaymentStatus,
          number
        >,
      );

    const monthlyMap = new Map<
      string,
      {
        orders: number;
        revenue: number;
      }
    >();

    for (const order of orders) {
      const status =
        order.status as DashboardOrderStatus;

      const paymentStatus =
        order.paymentStatus as DashboardPaymentStatus;

      if (statusCounts[status] !== undefined) {
        statusCounts[status] += 1;
      }

      if (
        paymentCounts[paymentStatus] !==
        undefined
      ) {
        paymentCounts[paymentStatus] += 1;
      }

      const month = getMonthKey(
        order.createdAt,
      );

      const current =
        monthlyMap.get(month) ?? {
          orders: 0,
          revenue: 0,
        };

      current.orders += 1;

      if (paymentStatus === "PAID") {
        current.revenue += decimalToNumber(
          order.total,
        );
      }

      monthlyMap.set(month, current);
    }

    const monthly = Array.from(
      monthlyMap.entries(),
    ).map(([month, values]) => ({
      month,
      ...values,
    }));

    res.status(200).json({
      success: true,
      data: {
        statusCounts,
        paymentCounts,
        monthly,
      },
    });
  } catch (error) {
    console.error(
      "Failed to load admin dashboard order statistics:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to load order statistics";

    res.status(400).json({
      success: false,
      message,
    });
  }
}

/**
 * GET /admin/dashboard/categories
 */
export async function getAdminDashboardCategorySales(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { fromDate, toDate } = getDateRange(req);

    const items = await prisma.orderItem.findMany({
      where: {
        order: {
          ...getOrderDateWhere(
            fromDate,
            toDate,
          ),
          paymentStatus: "PAID",
        },
      },
      select: {
        quantity: true,
        totalPrice: true,

        variant: {
          select: {
            product: {
              select: {
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const categoryMap = new Map<
      string,
      {
        categoryId: string;
        categoryName: string;
        quantity: number;
        revenue: number;
      }
    >();

    for (const item of items) {
      const category =
        item.variant.product.category;

      const current =
        categoryMap.get(category.id) ?? {
          categoryId: category.id,
          categoryName: category.name,
          quantity: 0,
          revenue: 0,
        };

      current.quantity += item.quantity;

      current.revenue += decimalToNumber(
        item.totalPrice,
      );

      categoryMap.set(
        category.id,
        current,
      );
    }

    const data = Array.from(
      categoryMap.values(),
    ).sort(
      (a, b) =>
        b.revenue - a.revenue,
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Failed to load admin category sales:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to load category sales";

    res.status(400).json({
      success: false,
      message,
    });
  }
}

/**
 * GET /admin/dashboard/best-sellers
 */
export async function getAdminDashboardBestSellers(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { fromDate, toDate } = getDateRange(req);

    const items = await prisma.orderItem.findMany({
      where: {
        order: {
          ...getOrderDateWhere(
            fromDate,
            toDate,
          ),
          paymentStatus: "PAID",
        },
      },
      select: {
        productName: true,
        sku: true,
        quantity: true,
        totalPrice: true,
      },
    });

    const productMap = new Map<
      string,
      {
        productName: string;
        sku: string;
        quantity: number;
        revenue: number;
      }
    >();

    for (const item of items) {
      const key = item.sku;

      const current =
        productMap.get(key) ?? {
          productName: item.productName,
          sku: item.sku,
          quantity: 0,
          revenue: 0,
        };

      current.quantity += item.quantity;

      current.revenue += decimalToNumber(
        item.totalPrice,
      );

      productMap.set(
        key,
        current,
      );
    }

    const data = Array.from(
      productMap.values(),
    )
      .sort(
        (a, b) =>
          b.quantity - a.quantity,
      )
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Failed to load admin best sellers:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to load best sellers";

    res.status(400).json({
      success: false,
      message,
    });
  }
}
export async function getAdminAnalytics(req: Request, res: Response): Promise<void> {
  try {
    const { fromDate, toDate } = getDateRange(req);
    const where = { ...getOrderDateWhere(fromDate, toDate), paymentStatus: "PAID" as const };
    const orders = await prisma.order.findMany({ where, select: { userId: true, total: true } });
    const revenue = orders.reduce((sum, order) => sum + decimalToNumber(order.total), 0);
    const customers = new Set(orders.map((order) => order.userId));
    const allCustomerOrderCounts = await prisma.order.groupBy({ by: ["userId"], where: { paymentStatus: "PAID" }, _count: { _all: true } });
    const countByCustomer = new Map(allCustomerOrderCounts.map((entry) => [entry.userId, entry._count._all]));
    const returningCustomers = [...customers].filter((id) => (countByCustomer.get(id) ?? 0) > 1).length;
    res.json({ success: true, data: { revenue, paidOrders: orders.length, averageOrderValue: orders.length ? revenue / orders.length : 0, purchasingCustomers: customers.size, newCustomers: customers.size - returningCustomers, returningCustomers } });
  } catch (error) { console.error("Failed to load analytics:", error); res.status(400).json({ success: false, message: "Failed to load analytics" }); }
}
