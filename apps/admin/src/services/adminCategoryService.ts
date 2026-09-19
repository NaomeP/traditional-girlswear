import { API_BASE_URL } from "../config/api";

import type { Category } from "../types/product";

export type CategoryInput = {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
};

type CategoriesResponse = {
  success: boolean;
  data: Category[];
  message?: string;
};

type CategoryResponse = {
  success: boolean;
  data: Category;
  message?: string;
};

type CategoryDeleteResponse = {
  success: boolean;
  message?: string;
};

export async function getAdminCategories(): Promise<Category[]> {
  const response = await fetch(
    `${API_BASE_URL}/admin/categories`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const result =
    (await response.json().catch(() => null)) as
      | CategoriesResponse
      | null;

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message ||
        "Failed to load categories",
    );
  }

  return result.data;
}

export async function createAdminCategory(
  category: CategoryInput,
): Promise<Category> {
  const response = await fetch(
    `${API_BASE_URL}/admin/categories`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(category),
    },
  );

  const result =
    (await response.json().catch(() => null)) as
      | CategoryResponse
      | null;

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message ||
        "Failed to create category",
    );
  }

  return result.data;
}

export async function updateAdminCategory(
  categoryId: string,
  category: CategoryInput,
): Promise<Category> {
  const response = await fetch(
    `${API_BASE_URL}/admin/categories/${categoryId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(category),
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
): Promise<string> {
  const response = await fetch(
    `${API_BASE_URL}/admin/categories/${categoryId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  const result =
    (await response.json().catch(() => null)) as
      | CategoryDeleteResponse
      | null;

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message ||
        "Failed to delete category",
    );
  }

  return (
    result.message ||
    "Category deleted successfully"
  );
}