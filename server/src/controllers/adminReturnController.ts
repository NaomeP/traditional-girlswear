
import { Response } from "express";

import prisma from "../config/prisma";

import { AuthenticatedRequest } from "../middleware/authMiddleware";

const RETURN_STATUSES = [
  "REQUESTED",
  "APPROVED",
  "REJECTED",
  "PICKED_UP",
  "RECEIVED",
  "REFUNDED",
  "CANCELLED",
] as const;

type ReturnStatus =
  (typeof RETURN_STATUSES)[number];

function getUserId(
  req: AuthenticatedRequest,
): string | null {
  return req.user?.userId ?? null;
}

function serializeAdminReturn(
  returnRequest: any,
) {
  return {
    id: returnRequest.id,

    orderId:
      returnRequest.orderId,

    orderNumber:
      returnRequest.order?.orderNumber ?? null,

    status:
      returnRequest.status,

    reason:
      returnRequest.reason,

    customerNote:
      returnRequest.customerNote,

    adminNote:
      returnRequest.adminNote,

    refundAmount:
      returnRequest.refundAmount,

    refundMethod:
      returnRequest.refundMethod,

    refundReference:
      returnRequest.refundReference,

    requestedAt:
      returnRequest.requestedAt,

    approvedAt:
      returnRequest.approvedAt,

    rejectedAt:
      returnRequest.rejectedAt,

    pickedUpAt:
      returnRequest.pickedUpAt,

    receivedAt:
      returnRequest.receivedAt,

    refundedAt:
      returnRequest.refundedAt,

    cancelledAt:
      returnRequest.cancelledAt,

    createdAt:
      returnRequest.createdAt,

    updatedAt:
      returnRequest.updatedAt,

    customer:
      returnRequest.user
        ? {
            id:
              returnRequest.user.id,
            name:
              returnRequest.user.name,
            email:
              returnRequest.user.email,
            mobile:
              returnRequest.user.mobile,
          }
        : null,

    order:
      returnRequest.order
        ? {
            id:
              returnRequest.order.id,
            orderNumber:
              returnRequest.order.orderNumber,
            status:
              returnRequest.order.status,
            paymentStatus:
              returnRequest.order.paymentStatus,
            paymentMethod:
              returnRequest.order.paymentMethod,
            subtotal:
              returnRequest.order.subtotal,
            discount:
              returnRequest.order.discount,
            shippingFee:
              returnRequest.order.shippingFee,
            total:
              returnRequest.order.total,
            createdAt:
              returnRequest.order.createdAt,
          }
        : null,

    items:
      returnRequest.items.map(
        (item: any) => ({
          id:
            item.id,

          orderItemId:
            item.orderItemId,

          quantity:
            item.quantity,

          refundAmount:
            item.refundAmount,

          productName:
            item.orderItem.productName,

          size:
            item.orderItem.size,

          color:
            item.orderItem.color,

          sku:
            item.orderItem.sku,

          unitPrice:
            item.orderItem.unitPrice,

          totalPrice:
            item.orderItem.totalPrice,
        }),
      ),
  };
}

const adminReturnInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
    },
  },

  order: {
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      subtotal: true,
      discount: true,
      shippingFee: true,
      total: true,
      createdAt: true,
    },
  },

  items: {
    orderBy: {
      createdAt: "asc" as const,
    },

    include: {
      orderItem: {
        select: {
          id: true,
          productName: true,
          size: true,
          color: true,
          sku: true,
          quantity: true,
          unitPrice: true,
          totalPrice: true,
        },
      },
    },
  },
};

// GET ALL RETURN REQUESTS
export async function getAdminReturnsController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const status =
      typeof req.query.status === "string"
        ? req.query.status.trim()
        : "";

    if (
      status &&
      !RETURN_STATUSES.includes(
        status as ReturnStatus,
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid return status",
      });
    }

    const returns =
      await prisma.returnRequest.findMany({
        where: {
          ...(status
            ? {
                status:
                  status as ReturnStatus,
              }
            : {}),

          ...(search
            ? {
                OR: [
                  {
                    id: {
                      contains:
                        search,
                      mode: "insensitive",
                    },
                  },
                  {
                    order: {
                      orderNumber: {
                        contains:
                          search,
                        mode: "insensitive",
                      },
                    },
                  },
                  {
                    user: {
                      name: {
                        contains:
                          search,
                        mode: "insensitive",
                      },
                    },
                  },
                  {
                    user: {
                      email: {
                        contains:
                          search,
                        mode: "insensitive",
                      },
                    },
                  },
                ],
              }
            : {}),
        },

        orderBy: {
          createdAt: "desc",
        },

        include:
          adminReturnInclude,
      });

    return res.status(200).json({
      success: true,
      data: returns.map(
        serializeAdminReturn,
      ),
    });
  } catch (error) {
    console.error(
      "Get admin returns error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load return requests",
    });
  }
}

// GET SINGLE RETURN REQUEST
export async function getAdminReturnByIdController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const id =
      String(
        req.params.id ?? "",
      ).trim();

    if (!id || id === "undefined") {
      return res.status(400).json({
        success: false,
        message:
          "Return request ID is required",
      });
    }

    const returnRequest =
      await prisma.returnRequest.findUnique({
        where: {
          id,
        },

        include:
          adminReturnInclude,
      });

    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message:
          "Return request not found",
      });
    }

    return res.status(200).json({
      success: true,
      data:
        serializeAdminReturn(
          returnRequest,
        ),
    });
  } catch (error) {
    console.error(
      "Get admin return error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load return request",
    });
  }
}

// UPDATE RETURN STATUS
export async function updateAdminReturnStatusController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const id =
      String(
        req.params.id ?? "",
      ).trim();

    if (!id || id === "undefined") {
      return res.status(400).json({
        success: false,
        message:
          "Return request ID is required",
      });
    }

    const status =
      req.body?.status;

    if (
      typeof status !== "string" ||
      !RETURN_STATUSES.includes(
        status as ReturnStatus,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid return status",
      });
    }

    const adminNote =
      typeof req.body?.adminNote ===
      "string"
        ? req.body.adminNote.trim()
        : null;

    if (
      adminNote &&
      adminNote.length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Admin note cannot exceed 1000 characters",
      });
    }

    const returnRequest =
      await prisma.returnRequest.findUnique({
        where: {
          id,
        },
      });

    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message:
          "Return request not found",
      });
    }

    const now =
      new Date();

    const data: any = {
      status:
        status as ReturnStatus,
    };

    if (
      adminNote !== null
    ) {
      data.adminNote =
        adminNote || null;
    }

    if (
      status === "APPROVED"
    ) {
      data.approvedAt =
        now;
    }

    if (
      status === "REJECTED"
    ) {
      data.rejectedAt =
        now;
    }

    if (
      status === "PICKED_UP"
    ) {
      data.pickedUpAt =
        now;
    }

    if (
      status === "RECEIVED"
    ) {
      data.receivedAt =
        now;
    }

    if (
      status === "REFUNDED"
    ) {
      data.refundedAt =
        now;
    }

    if (
      status === "CANCELLED"
    ) {
      data.cancelledAt =
        now;
    }

    const updatedReturn =
      await prisma.returnRequest.update({
        where: {
          id,
        },

        data,

        include:
          adminReturnInclude,
      });

    return res.status(200).json({
      success: true,
      message:
        "Return request updated successfully",
      data:
        serializeAdminReturn(
          updatedReturn,
        ),
    });
  } catch (error) {
    console.error(
      "Update admin return error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update return request",
    });
  }
}

