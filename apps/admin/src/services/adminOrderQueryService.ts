import { API_BASE_URL } from "../config/api";
import type {
  AdminOrder,
  AdminOrderStatus,
} from "./adminOrderService";

export const ADMIN_PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
] as const;

export type AdminPaymentStatus =
  (typeof ADMIN_PAYMENT_STATUSES)[number];

export type AdminOrderQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: AdminOrderStatus | "";
  paymentStatus?: AdminPaymentStatus | "";
  from?: string;
  to?: string;
};

export type AdminOrderPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminOrderQueryResult = {
  orders: AdminOrder[];
  pagination: AdminOrderPagination;
  filters: {
    search: string;
    status: string;
    paymentStatus: string;
    from: string;
    to: string;
  };
};

type AdminOrderQueryResponse = {
  success: boolean;
  data: AdminOrderQueryResult;
  message?: string;
};

function buildQueryString(
  params: AdminOrderQuery,
): string {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set(
      "page",
      String(params.page),
    );
  }

  if (params.limit) {
    searchParams.set(
      "limit",
      String(params.limit),
    );
  }

  if (params.search?.trim()) {
    searchParams.set(
      "search",
      params.search.trim(),
    );
  }

  if (params.status) {
    searchParams.set(
      "status",
      params.status,
    );
  }

  if (params.paymentStatus) {
    searchParams.set(
      "paymentStatus",
      params.paymentStatus,
    );
  }

  if (params.from) {
    searchParams.set("from", params.from);
  }

  if (params.to) {
    searchParams.set("to", params.to);
  }

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}

export async function getAdminOrdersQuery(
  params: AdminOrderQuery = {},
): Promise<AdminOrderQueryResult> {
  const response = await fetch(
    `${API_BASE_URL}/admin/orders/query${buildQueryString(params)}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const result =
    (await response.json()) as AdminOrderQueryResponse;

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Failed to load customer orders",
    );
  }

  return result.data;
}