import { API_BASE_URL } from "../config/api";

import type { Category } from "../types/product";

type CategoryResponse = {
  success: boolean;
  data: Category;
  message?: string;
};

export async function updateAdminCategory(
  categoryId: string,
  data: {
    name: string;
    slug: string;
    description: string;
    isActive: boolean;
    sortOrder: number;
  },
): Promise<Category> {
  const response = await fetch(
    `${API_BASE_URL}/admin/categories/${categoryId}`,
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
    (await response.json().catch(() => null)) as
      | CategoryResponse
      | null;

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message ||
        "Failed to update category",
    );
  }

  return result.data;
}

export async function deleteAdminCategory(
  categoryId: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/admin/categories/${categoryId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  const result =
    (await response.json().catch(() => null)) as
      | {
          success: boolean;
          message?: string;
        }
      | null;

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message ||
        "Failed to delete category",
    );
  }
}