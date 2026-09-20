import { z } from "zod";

const variantSchema = z.object({
  id: z.string().cuid().optional(),
  size: z.string().trim().min(1, "Size is required").max(50),
  color: z.string().trim().min(1, "Color is required").max(50),
  sku: z.string().trim().min(1, "Variant SKU is required").max(100),
  price: z.coerce.number().positive("Variant price must be greater than 0"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
});

const imageSchema = z.object({
  imageUrl: z.string().trim().url("Invalid image URL"),
  altText: z.string().trim().max(200).optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(200),
  slug: z.string().trim().min(2).max(200),
  sku: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(5000),
  material: z.string().trim().min(1).max(100),
  color: z.string().trim().min(1).max(100),

  status: z
    .enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK"])
    .default("ACTIVE"),

  basePrice: z.coerce.number().positive(),
  discountPrice: z.coerce.number().positive().nullable().optional(),

  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestseller: z.boolean().default(false),

  categoryId: z.string().min(1, "Category is required"),

  ageGroups: z
  .array(z.string().trim().min(1))
  .default([]),

  tags: z.array(z.string().trim().min(1)).default([]),

  images: z.array(imageSchema).default([]),

  variants: z
    .array(variantSchema)
    .min(1, "At least one variant is required"),
});

export const updateProductSchema =
  createProductSchema.partial();

export type CreateProductInput =
  z.infer<typeof createProductSchema>;

export type UpdateProductInput =
  z.infer<typeof updateProductSchema>;
