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

const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;

function parsePositiveInteger(
  value: unknown,
  fallback: number,
): number {
  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed < 1
  ) {
    return fallback;
  }

  return parsed;
}

function parseDateStart(
  value: unknown,
): Date | undefined {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return undefined;
  }

  const date = new Date(
    `${value}T00:00:00.000Z`,
  );

  if (Number.isNaN(date.getTime())) {
    throw new Error(
      `Invalid from date: ${value}`,
    );
  }

  return date;
}

function parseDateEnd(
  value: unknown,
): Date | undefined {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return undefined;
  }

  const date = new Date(
    `${value}T23:59:59.999Z`,
  );

  if (Number.isNaN(date.getTime())) {
    throw new Error(
      `Invalid to date: ${value}`,
    );
  }

  return date;
}

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

export async function getAdminOrdersQuery(
  req: Request,
  res: Response,
): Promise<Response> {
  try {
    const page = parsePositiveInteger(
      req.query.page,
      1,
    );

    const requestedLimit =
      parsePositiveInteger(
        req.query.limit,
        20,
      );

    const limit = Math.min(
      requestedLimit,
      100,
    );

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const status =
      typeof req.query.status === "string"
        ? req.query.status.trim()
        : "";

    const paymentStatus =
      typeof req.query.paymentStatus ===
      "string"
        ? req.query.paymentStatus.trim()
        : "";

    const fromDate = parseDateStart(
      req.query.from,
    );

    const toDate = parseDateEnd(
      req.query.to,
    );

    if (
      fromDate &&
      toDate &&
      fromDate > toDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "'from' date cannot be later than 'to' date",
      });
    }

    if (
      status &&
      !ORDER_STATUSES.includes(
        status as (typeof ORDER_STATUSES)[number],
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    if (
      paymentStatus &&
      !PAYMENT_STATUSES.includes(
        paymentStatus as (typeof PAYMENT_STATUSES)[number],
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const where: {
      status?: (typeof ORDER_STATUSES)[number];

      paymentStatus?: (
        typeof PAYMENT_STATUSES
      )[number];

      createdAt?: {
        gte?: Date;
        lte?: Date;
      };

      OR?: Array<
        | {
            orderNumber: {
              contains: string;
              mode: "insensitive";
            };
          }
        | {
            user: {
              name: {
                contains: string;
                mode: "insensitive";
              };
            };
          }
        | {
            user: {
              email: {
                contains: string;
                mode: "insensitive";
              };
            };
          }
        | {
            user: {
              mobile: {
                contains: string;
                mode: "insensitive";
              };
            };
          }
      >;
    } = {};

    if (status) {
      where.status =
        status as (typeof ORDER_STATUSES)[number];
    }

    if (paymentStatus) {
      where.paymentStatus =
        paymentStatus as (
          typeof PAYMENT_STATUSES
        )[number];
    }

    if (fromDate || toDate) {
      where.createdAt = {};

      if (fromDate) {
        where.createdAt.gte = fromDate;
      }

      if (toDate) {
        where.createdAt.lte = toDate;
      }
    }

    if (search) {
      where.OR = [
        {
          orderNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          user: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            mobile: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const skip =
      (page - 1) * limit;

    const [orders, total] =
      await prisma.$transaction([
        prisma.order.findMany({
          where,

          orderBy: {
            createdAt: "desc",
          },

          skip,
          take: limit,

          include: orderInclude(),
        }),

        prisma.order.count({
          where,
        }),
      ]);

    const totalPages =
      total === 0
        ? 0
        : Math.ceil(total / limit);

    return res.status(200).json({
      success: true,

      data: {
        orders,

        pagination: {
          page,
          limit,
          total,
          totalPages,

          hasNextPage:
            page < totalPages,

          hasPreviousPage:
            page > 1 &&
            totalPages > 0,
        },

        filters: {
          search: search || null,
          status: status || null,
          paymentStatus:
            paymentStatus || null,

          from: fromDate
            ? fromDate.toISOString()
            : null,

          to: toDate
            ? toDate.toISOString()
            : null,
        },
      },
    });
  } catch (error) {
    console.error(
      "Failed to query admin orders:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        error instanceof Error
          ? error.message
          : "Failed to load admin orders",
    });
  }
}