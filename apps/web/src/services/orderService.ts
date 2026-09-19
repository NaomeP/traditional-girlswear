import { API_BASE_URL } from "../config/api";

export interface CreateOrderItem {
  variantId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  userId: string;
  addressId: string;
  paymentMethod: "ONLINE" | "COD";
  items: CreateOrderItem[];
  couponCode?: string;
  notes?: string;
}

export interface CreatedOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: string;
  discount: string;
  shippingFee: string;
  total: string;
}

interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: CreatedOrder;
}

export async function createOrder(
  orderData: CreateOrderRequest,
): Promise<CreatedOrder> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  const result: CreateOrderResponse | { message?: string } =
    await response.json();

  if (!response.ok) {
    throw new Error(
      "message" in result && result.message
        ? result.message
        : "Failed to create order",
    );
  }

  if (!("success" in result) || !result.success) {
    throw new Error("Failed to create order");
  }

  return result.data;
}