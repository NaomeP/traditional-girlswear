import type {
  Product as ApiProduct,
  ProductVariant,
} from "../services/productService";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  ageGroups: string[];
  sizes: string[];
  material: string;
  color: string;
  price: number;
  originalPrice?: number;
  image: string;
  featured?: boolean;
  newArrival?: boolean;
  bestseller?: boolean;
  variants: ProductVariant[];
};

export function mapApiProductToProduct(
  product: ApiProduct,
): Product {
  const primaryImage =
    product.images.find((image) => image.isPrimary) ??
    product.images[0];

  const price = Number(
    product.discountPrice ?? product.basePrice,
  );

  const originalPrice =
    product.discountPrice !== null
      ? Number(product.basePrice)
      : undefined;

  const sizes = product.variants.map(
    (variant) => variant.size,
  );

  const variants: ProductVariant[] = product.variants.map(
    (variant) => ({
      ...variant,
      price: Number(variant.price),
    }),
  );

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category.name,
    ageGroups: product.ageGroups,
    sizes: [...new Set(sizes)],
    material: product.material,
    color: product.color,
    price,
    originalPrice,
    image: primaryImage?.imageUrl ?? "",
    featured: product.isFeatured,
    newArrival: product.isNewArrival,
    bestseller: product.isBestseller,
    variants,
  };
}