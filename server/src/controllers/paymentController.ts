import {
  Request,
  Response,
} from "express";

import {
  createOnlinePaymentOrder,
  verifyOnlinePayment,
  handlePaymentWebhook,
} from "../services/paymentService";

import {
  AuthenticatedRequest,
} from "../middleware/authMiddleware";

export async function createPaymentController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

   const orderId = Array.isArray(req.params.orderId)
  ? req.params.orderId[0]
  : req.params.orderId;

if (!orderId) {
  res.status(400).json({
    success: false,
    message: "Order ID is required",
  });
  return;
}

    const payment =
      await createOnlinePaymentOrder(
        orderId,
        userId,
      );

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error(
      "Create payment error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create payment";

    res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function verifyPaymentController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    if (
      !orderId ||
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      res.status(400).json({
        success: false,
        message:
          "Payment verification details are required",
      });
      return;
    }

    const order =
      await verifyOnlinePayment(
        userId,
        {
          orderId,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
        },
      );

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: order,
    });
  } catch (error) {
    console.error(
      "Verify payment error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Payment verification failed";

    res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function paymentWebhookController(
  req: Request,
  res: Response,
) {
  try {
    await handlePaymentWebhook(req.body);

    res.status(200).json({
      success: true,
      message: "Webhook processed",
    });
  } catch (error) {
    console.error(
      "Payment webhook error:",
      error,
    );

    res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
}