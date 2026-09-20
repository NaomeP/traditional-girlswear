import { API_BASE_URL } from "../config/api";
import type { Product } from "../data/products";

export type PendingProductAction = {
  type: "cart" | "wishlist";
  product: Product;
  size?: string;
  quantity?: number;
};

export async function isAuthenticated(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: "include",
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.success === true;
  } catch {
    return false;
  }
}
