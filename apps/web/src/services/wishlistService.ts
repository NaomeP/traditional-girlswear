import { API_BASE_URL } from "../config/api";

export interface WishlistItem {
  id: string;
  variantId: string;
}

interface WishlistResponse {
  success: boolean;
  data: WishlistItem[];
}

interface WishlistItemResponse {
  success: boolean;
  message?: string;
  data: WishlistItem;
}

export async function getWishlist(): Promise<
  WishlistItem[]
> {
  const response = await fetch(
    `${API_BASE_URL}/wishlist`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (response.status === 401) {
    return [];
  }

  const result: WishlistResponse =
    await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      "Failed to load wishlist",
    );
  }

  return result.data;
}

export async function addWishlistItem(
  variantId: string,
): Promise<WishlistItem> {
  const response = await fetch(
    `${API_BASE_URL}/wishlist`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        variantId,
      }),
    },
  );

  const result: WishlistItemResponse =
    await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Failed to add wishlist item",
    );
  }

  return result.data;
}

export async function removeWishlistItem(
  variantId: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/wishlist/${variantId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!response.ok) {
    const result = await response
      .json()
      .catch(() => null);

    throw new Error(
      result?.message ||
        "Failed to remove wishlist item",
    );
  }
}

export async function clearWishlist(): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/wishlist`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!response.ok) {
    const result = await response
      .json()
      .catch(() => null);

    throw new Error(
      result?.message ||
        "Failed to clear wishlist",
    );
  }
}