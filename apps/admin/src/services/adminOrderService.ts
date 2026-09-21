import { API_BASE_URL } from "../config/api";

// Order statuses
export const ADMIN_ORDER_STATUSES = [
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

export type AdminOrderStatus =
  (typeof ADMIN_ORDER_STATUSES)[number];

// Shipment statuses
export const SHIPMENT_STATUSES = [
  "PENDING",
  "SHIPPED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "RETURNED",
] as const;

export type ShipmentStatus =
  (typeof SHIPMENT_STATUSES)[number];

// Admin order type
export type AdminOrder = {
  id: string;
  createdAt: string;
  status: AdminOrderStatus;
  totalAmount: string | number;

  user: {
    id: string;
    name: string;
    email: string;
    mobile: string | null;
  };

  address: {
    fullName: string;
    mobile: string;
    addressLine1: string;
    addressLine2: string | null;
    landmark: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  items: {
    id: string;
    productName: string;
    quantity: number;
    unitPrice: string | number;

    variant: {
      size: string;
      color: string;
      sku: string;
    };
  }[];

  payment: {
    status: string;
    method: string;
  } | null;

  shipment: {
    id?: string;
    courierName: string | null;
    trackingNumber: string | null;
    trackingUrl: string | null;
    status: ShipmentStatus;
    shippedAt: string | null;
    deliveredAt: string | null;
  } | null;
};

// API response types
type AdminOrdersResponse = {
  success: boolean;
  data: AdminOrder[];
  message?: string;
};

type AdminOrderResponse = {
  success: boolean;
  data: AdminOrder;
  message?: string;
};

// Get all admin orders
export async function getAdminOrders(): Promise<AdminOrder[]> {
  const response = await fetch(
    `${API_BASE_URL}/admin/orders`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const result =
    (await response.json()) as AdminOrdersResponse;

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to load customer orders",
    );
  }

  return result.data;
}

// Update order status
export async function updateAdminOrderStatus(
  orderId: string,
  status: AdminOrderStatus,
): Promise<AdminOrder> {
  const response = await fetch(
    `${API_BASE_URL}/admin/orders/${orderId}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        status,
      }),
    },
  );

  const result =
    (await response.json()) as AdminOrderResponse;

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to update order status",
    );
  }

  return result.data;
}

// Update shipping details
export async function updateAdminShipment(
  orderId: string,
  shipment: {
    courierName: string;
    trackingNumber: string;
    trackingUrl?: string;
    status: ShipmentStatus;
    shippedAt?: string | null;
    deliveredAt?: string | null;
  },
): Promise<AdminOrder> {
  const response = await fetch(
    `${API_BASE_URL}/admin/orders/${orderId}/shipment`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        courierName: shipment.courierName,
        trackingNumber: shipment.trackingNumber,
        trackingUrl: shipment.trackingUrl || null,
        status: shipment.status,
        shippedAt: shipment.shippedAt || null,
        deliveredAt: shipment.deliveredAt || null,
      }),
    },
  );

  const result =
    (await response.json()) as AdminOrderResponse;

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to update shipping details",
    );
  }

  return result.data;
}
