
const API_BASE_URL = "http://localhost:5000/api/v1";

export type AdminCouponDiscountType =
  | "PERCENTAGE"
  | "FIXED";

export type AdminCouponStatus =
  | "ACTIVE"
  | "INACTIVE";

export interface AdminCoupon {
  id: string;
  code: string;
  discountType: AdminCouponDiscountType;
  discountValue: number | string;
  minimumOrderValue: number | string | null;
  maximumDiscount: number | string | null;
  usageLimit: number | null;
  usedCount: number;
  startsAt: string;
  expiresAt: string;
  status: AdminCouponStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCouponInput {
  code: string;
  discountType: AdminCouponDiscountType;
  discountValue: number;
  minimumOrderValue: number | null;
  maximumDiscount: number | null;
  usageLimit: number | null;
  startsAt: string;
  expiresAt: string;
  status: AdminCouponStatus;
}

interface CouponResponse {
  success: boolean;
  message?: string;
  data?: AdminCoupon | AdminCoupon[];
}

async function parseResponse(
  response: Response,
): Promise<CouponResponse> {
  let result: CouponResponse | null = null;

  try {
    result =
      (await response.json()) as CouponResponse;
  } catch {
    result = null;
  }

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "Unable to complete coupon request.",
    );
  }

  if (!result?.success) {
    throw new Error(
      result?.message ||
        "Coupon request failed.",
    );
  }

  return result;
}

export async function getAdminCoupons(): Promise<
  AdminCoupon[]
> {
  const response = await fetch(
    `${API_BASE_URL}/admin/coupons`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const result =
    await parseResponse(response);

  if (!Array.isArray(result.data)) {
    return [];
  }

  return result.data;
}

export async function createAdminCoupon(
  input: AdminCouponInput,
): Promise<AdminCoupon> {
  const response = await fetch(
    `${API_BASE_URL}/admin/coupons`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  const result =
    await parseResponse(response);

  if (
    !result.data ||
    Array.isArray(result.data)
  ) {
    throw new Error(
      "Invalid coupon response.",
    );
  }

  return result.data;
}

export async function updateAdminCoupon(
  id: string,
  input: AdminCouponInput,
): Promise<AdminCoupon> {
  const response = await fetch(
    `${API_BASE_URL}/admin/coupons/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  const result =
    await parseResponse(response);

  if (
    !result.data ||
    Array.isArray(result.data)
  ) {
    throw new Error(
      "Invalid coupon response.",
    );
  }

  return result.data;
}

export async function deleteAdminCoupon(
  id: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/admin/coupons/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  await parseResponse(response);
}
