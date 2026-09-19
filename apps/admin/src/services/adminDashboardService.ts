console.log("### CORRECT ADMIN DASHBOARD SERVICE LOADED ###");

import { API_BASE_URL } from "../config/api";

export type AdminDashboardSummary = {
  totalRevenue: string | number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;

  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  refundedOrders: number;

  refundAmount: string | number | null;
};

export type AdminDashboardRevenuePoint = {
  date: string;
  revenue: string | number;
};

export type AdminDashboardOrderStat = {
  date: string;
  orders: number;
  revenue: string | number;
};

export type AdminDashboardCategorySale = {
  categoryId: string;
  categoryName: string;
  quantity: number;
  revenue: string | number;
};

export type AdminDashboardBestSeller = {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  revenue: string | number;
};

type DashboardResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

async function dashboardRequest<T>(
  endpoint: string,
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}/admin/dashboard/${endpoint}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const result =
    (await response.json()) as DashboardResponse<T>;

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Failed to load admin dashboard data",
    );
  }

  return result.data;
}

export async function getAdminDashboardSummary(
  from?: string,
  to?: string,
): Promise<AdminDashboardSummary> {
  const params = new URLSearchParams();

  if (from) {
    params.set("from", from);
  }

  if (to) {
    params.set("to", to);
  }

  const query = params.toString();

  return dashboardRequest<AdminDashboardSummary>(
    `summary${query ? `?${query}` : ""}`,
  );
}

export async function getAdminDashboardRevenue(
  from?: string,
  to?: string,
): Promise<AdminDashboardRevenuePoint[]> {
  const params = new URLSearchParams();

  if (from) {
    params.set("from", from);
  }

  if (to) {
    params.set("to", to);
  }

  const query = params.toString();

  return dashboardRequest<
    AdminDashboardRevenuePoint[]
  >(
    `revenue${query ? `?${query}` : ""}`,
  );
}

export async function getAdminDashboardOrderStats(
  from?: string,
  to?: string,
): Promise<AdminDashboardOrderStat[]> {
  const params = new URLSearchParams();

  if (from) {
    params.set("from", from);
  }

  if (to) {
    params.set("to", to);
  }

  const query = params.toString();

  const result = await dashboardRequest<{
    statusCounts: Record<string, number>;
    paymentCounts: Record<string, number>;
    monthly: AdminDashboardOrderStat[];
  }>(
    `orders${query ? `?${query}` : ""}`,
  );

  return result.monthly;
}

export async function getAdminDashboardCategorySales(
  from?: string,
  to?: string,
): Promise<AdminDashboardCategorySale[]> {
  const params = new URLSearchParams();

  if (from) {
    params.set("from", from);
  }

  if (to) {
    params.set("to", to);
  }

  const query = params.toString();

  return dashboardRequest<
    AdminDashboardCategorySale[]
  >(
    `categories${query ? `?${query}` : ""}`,
  );
}

export async function getAdminDashboardBestSellers(
  from?: string,
  to?: string,
): Promise<AdminDashboardBestSeller[]> {
  const params = new URLSearchParams();

  if (from) {
    params.set("from", from);
  }

  if (to) {
    params.set("to", to);
  }

  const query = params.toString();

  return dashboardRequest<
    AdminDashboardBestSeller[]
  >(
    `best-sellers${query ? `?${query}` : ""}`,
  );
}