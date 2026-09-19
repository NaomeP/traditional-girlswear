import prisma from "../config/prisma";

export async function getWishlist(userId: string) {
  return prisma.wishlistItem.findMany({
    where: {
      userId,
    },
    include: {
      variant: {
        include: {
          product: {
            include: {
              category: true,
              images: {
                orderBy: {
                  sortOrder: "asc",
                },
              },
              variants: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function addToWishlist(
  userId: string,
  variantId: string,
) {
  const variant =
    await prisma.productVariant.findUnique({
      where: {
        id: variantId,
      },
      include: {
        product: true,
      },
    });

  if (!variant) {
    throw new Error("Product variant not found");
  }

  if (variant.product.status !== "ACTIVE") {
    throw new Error("This product is not available");
  }

  const existingItem =
    await prisma.wishlistItem.findUnique({
      where: {
        userId_variantId: {
          userId,
          variantId,
        },
      },
    });

  if (existingItem) {
    return existingItem;
  }

  return prisma.wishlistItem.create({
    data: {
      userId,
      variantId,
    },
  });
}

export async function removeFromWishlist(
  userId: string,
  variantId: string,
) {
  const existingItem =
    await prisma.wishlistItem.findUnique({
      where: {
        userId_variantId: {
          userId,
          variantId,
        },
      },
    });

  if (!existingItem) {
    throw new Error("Wishlist item not found");
  }

  await prisma.wishlistItem.delete({
    where: {
      id: existingItem.id,
    },
  });

  return {
    success: true,
  };
}

export async function clearWishlist(
  userId: string,
) {
  await prisma.wishlistItem.deleteMany({
    where: {
      userId,
    },
  });

  return {
    success: true,
  };
}