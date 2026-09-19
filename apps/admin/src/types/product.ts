export type ProductStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "OUT_OF_STOCK";

export type ProductVariant = {
  id: string;
  size: string;
  color: string;
  sku: string;
  price: string | number;
  stock: number;
};

export type ProductImage = {
  id: string;
  imageUrl: string;
  altText?: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  material: string;
  color: string;
  status: ProductStatus;

  basePrice: string | number;
  discountPrice?: string | number | null;

  isFeatured: boolean;
  isNewArrival: boolean;
  isBestseller: boolean;

  categoryId: string;
  category: Category;

  ageGroups: string[];
  tags: string[];

  images: ProductImage[];
  variants: ProductVariant[];

  createdAt: string;
  updatedAt: string;
};

export type ProductVariantInput = {
  size: string;
  color: string;
  sku: string;
  price: number;
  stock: number;
};

export type ProductImageInput = {
  imageUrl: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
  previewUrl?: string;
};

export type ProductInput = {
  name: string;
  slug: string;
  sku: string;
  description: string;
  material: string;
  color: string;

  status: ProductStatus;

  basePrice: number;
  discountPrice?: number | null;

  isFeatured: boolean;
  isNewArrival: boolean;
  isBestseller: boolean;

  categoryId: string;

  ageGroups: string[];
  tags: string[];

  images: ProductImageInput[];
  variants: ProductVariantInput[];
};