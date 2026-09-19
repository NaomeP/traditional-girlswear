import { Response } from "express";

import prisma from "../config/prisma";

import { AuthenticatedRequest } from "../middleware/authMiddleware";

//const RETURN_WINDOW_DAYS = 7;

const RETURN_REASONS = [
  "WRONG_PRODUCT",
  "DAMAGED_PRODUCT",
  "DEFECTIVE_PRODUCT",
  "DOES_NOT_MATCH_DESCRIPTION",
  "CHANGED_MY_MIND",
] as const;

type ReturnReason =
  (typeof RETURN_REASONS)[number];

function getUserId(
  req: AuthenticatedRequest,
): string | null {
  return req.user?.userId ?? null;
}

function isValidReturnReason(
  value: unknown,
): value is ReturnReason {
  return (
    typeof value === "string" &&
    RETURN_REASONS.includes(
      value as ReturnReason,
    )
  );
}

//function getReturnDeadline(
 // deliveredAt: Date,
//): Date {
  ///const deadline = new Date(deliveredAt);

 // deadline.setDate(
  //  deadline.getDate() + RETURN_WINDOW_DAYS,
 // );

 // return deadline;
//}

function serializeReturnRequest(
  returnRequest: any,
) {
  return {
    id: returnRequest.id,
    orderId: returnRequest.orderId,
    orderNumber:
      returnRequest.order?.orderNumber ?? null,

    status: returnRequest.status,
    reason: returnRequest.reason,

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

    items:
      returnRequest.items.map(
        (item: any) => ({
          id: item.id,
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
        }),
      ),
  };
}

const returnInclude = {
  order: {
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
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

// GET MY RETURN REQUESTS
export async function getMyReturnsController(
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

    const returns =
      await prisma.returnRequest.findMany({
        where: {
          userId,
        },

        orderBy: {
          createdAt: "desc",
        },

        include: returnInclude,
      });

    return res.status(200).json({
      success: true,
      data: returns.map(
        serializeReturnRequest,
      ),
    });
  } catch (error) {
    console.error(
      "Get my returns error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load return requests",
    });
  }
}

// GET SINGLE MY RETURN REQUEST
export async function getMyReturnByIdController(
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

    const id = String(req.params.id);

    if (!id || id === "undefined") {
      return res.status(400).json({
        success: false,
        message: "Return request ID is required",
      });
    }

    const returnRequest =
      await prisma.returnRequest.findFirst({
        where: {
          id,
          userId,
        },

        include: returnInclude,
      });

    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: serializeReturnRequest(
        returnRequest,
      ),
    });
  } catch (error) {
    console.error(
      "Get my return error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load return request",
    });
  }
}

// CREATE RETURN REQUEST
export async function createReturnRequestController(
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

    const orderId = String(
      req.body?.orderId ?? "",
    ).trim();

    const reason = req.body?.reason;

    const customerNote =
      typeof req.body?.customerNote === "string"
        ? req.body.customerNote.trim()
        : null;

    const requestedItems =
      req.body?.items;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    if (!isValidReturnReason(reason)) {
      return res.status(400).json({
        success: false,
        message: "Invalid return reason",
      });
    }

    if (
      customerNote &&
      customerNote.length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Return note cannot exceed 1000 characters",
      });
    }

    if (
      !Array.isArray(requestedItems) ||
      requestedItems.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one item must be selected",
      });
    }

    const order =
      await prisma.order.findFirst({
        where: {
          id: orderId,
          userId,
        },

        include: {
          items: {
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

          shipment: true,
        },
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      order.status !== "DELIVERED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only delivered orders can be returned",
      });
    }

    // if (
    //   !order.shipment?.deliveredAt
    // ) {
    //   return res.status(400).json({
    //     success: false,
    //     message:
    //       "Delivery date is not available for this order",
    //   });
    // }

    // const now = new Date();

    // const returnDeadline =
    //   getReturnDeadline(
    //     order.shipment.deliveredAt,
    //   );

    // if (now > returnDeadline) {
    //   return res.status(400).json({
    //     success: false,
    //     message:
    //       "The 7-day return window has expired",
    //   });
    // }

    const existingReturns =
      await prisma.returnRequest.findMany({
        where: {
          orderId,
          userId,
          status: {
            notIn: [
              "REJECTED",
              "CANCELLED",
            ],
          },
        },

        include: {
          items: {
            select: {
              orderItemId: true,
              quantity: true,
            },
          },
        },
      });

    const orderItemsById =
      new Map(
        order.items.map(
          (item) => [
            item.id,
            item,
          ],
        ),
      );

    const alreadyRequestedByItem =
      new Map<string, number>();

    for (
      const existingReturn of existingReturns
    ) {
      for (
        const item of existingReturn.items
      ) {
        const current =
          alreadyRequestedByItem.get(
            item.orderItemId,
          ) ?? 0;

        alreadyRequestedByItem.set(
          item.orderItemId,
          current + item.quantity,
        );
      }
    }

    const normalizedItems: {
      orderItemId: string;
      quantity: number;
    }[] = [];

    const seenItemIds =
      new Set<string>();

    for (
      const requestedItem of requestedItems
    ) {
      const orderItemId =
        typeof requestedItem?.orderItemId ===
        "string"
          ? requestedItem.orderItemId.trim()
          : "";

      const quantity =
        Number(
          requestedItem?.quantity,
        );

      if (!orderItemId) {
        return res.status(400).json({
          success: false,
          message:
            "Every return item must include an order item ID",
        });
      }
      if (
        seenItemIds.has(orderItemId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Duplicate return item selected",
        });
      }

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Return quantity must be at least 1",
        });
      }

      const orderItem =
        orderItemsById.get(
          orderItemId,
        );

      if (!orderItem) {
        return res.status(400).json({
          success: false,
          message:
            "One or more selected items do not belong to this order",
        });
      }

      const alreadyRequested =
        alreadyRequestedByItem.get(
          orderItemId,
        ) ?? 0;

      const remainingQuantity =
        orderItem.quantity -
        alreadyRequested;

      if (
        quantity >
        remainingQuantity
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Return quantity for ${orderItem.productName} cannot exceed ${remainingQuantity}`,
        });
      }

      seenItemIds.add(
        orderItemId,
      );

      normalizedItems.push({
        orderItemId,
        quantity,
      });
    }

    let calculatedRefund = 0;

    const itemsWithRefund =
      normalizedItems.map(
        (requestedItem) => {
          const orderItem =
            orderItemsById.get(
              requestedItem.orderItemId,
            )!;

          const refundAmount =
            Number(
              orderItem.unitPrice,
            ) *
            requestedItem.quantity;

          calculatedRefund +=
            refundAmount;

          return {
            ...requestedItem,
            refundAmount:
              refundAmount.toFixed(2),
          };
        },
      );

    const createdReturn =
      await prisma.$transaction(
        async (tx) => {
          const returnRequest =
            await tx.returnRequest.create({
              data: {
                orderId,
                userId,
                reason,
                customerNote:
                  customerNote || null,
                items: {
                  create:
                    itemsWithRefund.map(
                      (item) => ({
                        orderItemId:
                          item.orderItemId,
                        quantity:
                          item.quantity,
                        refundAmount:
                          item.refundAmount,
                      }),
                    ),
                },
              },

              include:
                returnInclude,
            });

          return returnRequest;
        },
      );

    return res.status(201).json({
      success: true,
      message:
        "Return request submitted successfully",
      data: {
        ...serializeReturnRequest(
          createdReturn,
        ),
        calculatedRefund:
          calculatedRefund.toFixed(2),
    
      },
    });
  } catch (error) {
    console.error(
      "Create return request error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create return request",
    });
  }
}

// CANCEL MY RETURN REQUEST
export async function cancelMyReturnController(
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

    const id = String(req.params.id);

    if (!id || id === "undefined") {
      return res.status(400).json({
        success: false,
        message: "Return request ID is required",
      });
    }

    const returnRequest =
      await prisma.returnRequest.findFirst({
        where: {
          id,
          userId,
        },
      });

    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    if (
      ![
        "REQUESTED",
        "APPROVED",
      ].includes(
        returnRequest.status,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This return request can no longer be cancelled",
      });
    }

    const updatedReturn =
      await prisma.returnRequest.update({
        where: {
          id: returnRequest.id,
        },

        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },

        include: returnInclude,
      });

    return res.status(200).json({
      success: true,
      message:
        "Return request cancelled successfully",
      data: serializeReturnRequest(
        updatedReturn,
      ),
    });
  } catch (error) {
    console.error(
      "Cancel return error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to cancel return request",
    });
  }
}