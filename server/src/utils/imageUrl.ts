/**
 * Repairs URLs saved by older admin builds that prefixed an already absolute
 * Cloudinary URL with the API host. This is response-only, so existing
 * products display again without requiring a database migration.
 */
export function normalizeImageUrl(imageUrl: string): string {
  const secondHttpsIndex = imageUrl.indexOf(
    "https://",
    "https://".length,
  );

  if (secondHttpsIndex > -1) {
    return imageUrl.slice(secondHttpsIndex);
  }

  const secondHttpIndex = imageUrl.indexOf(
    "http://",
    "http://".length,
  );

  if (secondHttpIndex > -1) {
    return imageUrl.slice(secondHttpIndex);
  }

  return imageUrl;
}

export function normalizeProductImages<
  T extends { images: { imageUrl: string }[] },
>(product: T): T {
  return {
    ...product,
    images: product.images.map((image) => ({
      ...image,
      imageUrl: normalizeImageUrl(image.imageUrl),
    })),
  };
}
