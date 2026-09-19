import { API_ENDPOINTS } from "../config/api";

export interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  sku: string;
  price: number;
  stock: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  material: string;
  color: string;
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
  basePrice: string;
  discountPrice: string | null;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestseller: boolean;
  categoryId: string;
  category: ProductCategory;
  ageGroups: string[];
  tags: string[];
  images: ProductImage[];
  variants: ProductVariant[];
}

interface ProductsResponse {
  success: boolean;
  data: Product[];
}

interface ProductResponse {
  success: boolean;
  data: Product;
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(API_ENDPOINTS.products);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const result: ProductsResponse = await response.json();

  if (!result.success) {
    throw new Error("Failed to load products");
  }

  return result.data;
}

export async function getProductBySlug(
  slug: string,
): Promise<Product> {
  const response = await fetch(
    API_ENDPOINTS.productBySlug(slug),
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Product not found");
    }

    throw new Error("Failed to fetch product");
  }

  const result: ProductResponse = await response.json();

  if (!result.success) {
    throw new Error("Failed to load product");
  }

  return result.data;
}