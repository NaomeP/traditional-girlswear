import { API_BASE_URL } from "../config/api";

export const ADMIN_RETURN_STATUSES = [
  "REQUESTED",
  "APPROVED",
  "REJECTED",
  "PICKED_UP",
  "RECEIVED",
  "REFUNDED",
  "CANCELLED",
] as const;

export type AdminReturnStatus =
  (typeof ADMIN_RETURN_STATUSES)[number];

export type AdminReturnItem = {
  id: string;
  orderItemId: string;
  productName: string;
  size: string;
  color: string;
  sku: string;
  quantity: number;
  refundAmount: string | number | null;
  unitPrice: string | number;
  totalPrice: string | number;
};

export type AdminReturn = {
  id: string;
  orderId: string;
  orderNumber: string;

  reason: string;
  status: AdminReturnStatus;

  customerNote: string | null;
  adminNote: string | null;

  refundAmount: string | number | null;
  refundMethod: string | null;
  refundReference: string | null;

  requestedAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  pickedUpAt: string | null;
  receivedAt: string | null;
  refundedAt: string | null;
  cancelledAt: string | null;

  createdAt: string;
  updatedAt: string;

  customer: {
    id: string;
    name: string;
    email: string;
    mobile: string | null;
  };

  order: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    subtotal: string | number;
    discount: string | number;
    shippingFee: string | number;
    total: string | number;
    createdAt: string;
  };

  items: AdminReturnItem[];
};

type AdminReturnsResponse = {
  success: boolean;
  data: AdminReturn[];
  message?: string;
};

type AdminReturnResponse = {
  success: boolean;
  data: AdminReturn;
  message?: string;
};

export async function getAdminReturns(params?: {
  search?: string;
  status?: AdminReturnStatus | "";
}): Promise<AdminReturn[]> {
  const searchParams = new URLSearchParams();

  if (params?.search?.trim()) {
    searchParams.set(
      "search",
      params.search.trim(),
    );
  }

  if (params?.status) {
    searchParams.set(
      "status",
      params.status,
    );
  }

  const query = searchParams.toString();

  const response = await fetch(
    `${API_BASE_URL}/admin/returns${
      query ? `?${query}` : ""
    }`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const result =
    (await response.json()) as AdminReturnsResponse;

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Failed to load return requests",
    );
  }

  return result.data;
}

export async function getAdminReturnById(
  returnId: string,
): Promise<AdminReturn> {
  const response = await fetch(
    `${API_BASE_URL}/admin/returns/${returnId}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const result =
    (await response.json()) as AdminReturnResponse;

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Failed to load return request",
    );
  }

  return result.data;
}

export async function updateAdminReturnStatus(
  returnId: string,
  data: {
    status: AdminReturnStatus;
    adminNote?: string;
    refundAmount?: number | null;
    refundMethod?: string | null;
    refundReference?: string | null;
  },
): Promise<AdminReturn> {
  const response = await fetch(
    `${API_BASE_URL}/admin/returns/${returnId}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    },
  );

  const result =
    (await response.json()) as AdminReturnResponse;

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Failed to update return request",
    );
  }

  return result.data;
}