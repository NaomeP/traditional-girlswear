import { Request, Response } from "express";
import prisma from "../config/prisma";
import {
  createProductSchema,
  updateProductSchema,
} from "../validators/productValidator";

export async function getAdminProducts(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        variants: {
          orderBy: {
            size: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error(
      "Failed to fetch admin products:",
      error,
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
}

export async function createAdminProduct(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const validation =
      createProductSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid product data",
        errors: validation.error.flatten(),
      });

      return;
    }

    const data = validation.data;

    const existingProduct =
      await prisma.product.findFirst({
        where: {
          OR: [
            { slug: data.slug },
            { sku: data.sku },
          ],
        },
      });

    if (existingProduct) {
      res.status(409).json({
        success: false,
        message:
          existingProduct.slug === data.slug
            ? "Product slug already exists"
            : "Product SKU already exists",
      });

      return;
    }

    const category =
      await prisma.category.findUnique({
        where: {
          id: data.categoryId,
        },
      });

    if (!category) {
      res.status(400).json({
        success: false,
        message: "Category not found",
      });

      return;
    }

    if (
      data.discountPrice !== null &&
      data.discountPrice !== undefined &&
      data.discountPrice >= data.basePrice
    ) {
      res.status(400).json({
        success: false,
        message:
          "Discount price must be lower than base price",
      });

      return;
    }

    const variantSkus =
      data.variants.map((variant) => variant.sku);

    if (
      new Set(variantSkus).size !==
      variantSkus.length
    ) {
      res.status(400).json({
        success: false,
        message:
          "Variant SKUs must be unique",
      });

      return;
    }

    const variantSizeColors =
      data.variants.map(
        (variant) =>
          `${variant.size.toLowerCase()}::${variant.color.toLowerCase()}`,
      );

    if (
      new Set(variantSizeColors).size !==
      variantSizeColors.length
    ) {
      res.status(400).json({
        success: false,
        message:
          "Duplicate variant size and color combination",
      });

      return;
    }

    const createdProduct =
      await prisma.$transaction(async (tx) => {
        const product =
          await tx.product.create({
            data: {
              name: data.name,
              slug: data.slug,
              sku: data.sku,
              description: data.description,
              material: data.material,
              color: data.color,
              status: data.status,
              basePrice: data.basePrice,
              discountPrice:
                data.discountPrice ?? null,
              isFeatured: data.isFeatured,
              isNewArrival: data.isNewArrival,
              isBestseller: data.isBestseller,
              categoryId: data.categoryId,
              ageGroups: data.ageGroups,
              tags: data.tags,
            },
          });

        if (data.images.length > 0) {
          await tx.productImage.createMany({
            data: data.images.map((image) => ({
              productId: product.id,
              imageUrl: image.imageUrl,
              altText: image.altText,
              sortOrder: image.sortOrder,
              isPrimary: image.isPrimary,
            })),
          });
        }

        await tx.productVariant.createMany({
          data: data.variants.map(
            (variant) => ({
              productId: product.id,
              size: variant.size,
              color: variant.color,
              sku: variant.sku,
              price: variant.price,
              stock: variant.stock,
            }),
          ),
        });

        return tx.product.findUnique({
          where: {
            id: product.id,
          },
          include: {
            category: true,
            images: {
              orderBy: {
                sortOrder: "asc",
              },
            },
            variants: {
              orderBy: {
                size: "asc",
              },
            },
          },
        });
      });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: createdProduct,
    });
  } catch (error) {
    console.error(
      "Failed to create admin product:",
      error,
    );

    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
}

export async function updateAdminProduct(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const productId = req.params.id;

    if (
      typeof productId !== "string" ||
      productId.trim().length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "Product ID is required",
      });

      return;
    }

    const validation =
      updateProductSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid product data",
        errors: validation.error.flatten(),
      });

      return;
    }

    const data = validation.data;

    const existingProduct =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
        include: {
          variants: true,
        },
      });

    if (!existingProduct) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });

      return;
    }

    if (
      data.slug !== undefined ||
      data.sku !== undefined
    ) {
      const duplicate =
        await prisma.product.findFirst({
          where: {
            AND: [
              {
                id: {
                  not: productId,
                },
              },
              {
                OR: [
                  data.slug
                    ? { slug: data.slug }
                    : undefined,
                  data.sku
                    ? { sku: data.sku }
                    : undefined,
                ].filter(Boolean) as {
                  slug?: string;
                  sku?: string;
                }[],
              },
            ],
          },
        });

      if (duplicate) {
        res.status(409).json({
          success: false,
          message:
            data.slug &&
            duplicate.slug === data.slug
              ? "Product slug already exists"
              : "Product SKU already exists",
        });

        return;
      }
    }

    if (data.categoryId !== undefined) {
      const category =
        await prisma.category.findUnique({
          where: {
            id: data.categoryId,
          },
        });

      if (!category) {
        res.status(400).json({
          success: false,
          message: "Category not found",
        });

        return;
      }
    }

    const basePrice =
      data.basePrice ?? existingProduct.basePrice;

    if (
      data.discountPrice !== undefined &&
      data.discountPrice !== null &&
      data.discountPrice >= Number(basePrice)
    ) {
      res.status(400).json({
        success: false,
        message:
          "Discount price must be lower than base price",
      });

      return;
    }

    if (
      data.variants !== undefined
    ) {
      const variantSkus =
        data.variants.map(
          (variant) => variant.sku,
        );

      if (
        new Set(variantSkus).size !==
        variantSkus.length
      ) {
        res.status(400).json({
          success: false,
          message:
            "Variant SKUs must be unique",
        });

        return;
      }

      const variantSizeColors =
        data.variants.map(
          (variant) =>
            `${variant.size.toLowerCase()}::${variant.color.toLowerCase()}`,
        );

      if (
        new Set(variantSizeColors).size !==
        variantSizeColors.length
      ) {
        res.status(400).json({
          success: false,
          message:
            "Duplicate variant size and color combination",
        });

        return;
      }
    }

    const variantsChanged =
      data.variants !== undefined &&
      (
        data.variants.length !==
          existingProduct.variants.length ||
        data.variants.some((variant) => {
          const existingVariant =
            existingProduct.variants.find(
              (candidate) =>
                candidate.sku === variant.sku,
            );

          return (
            !existingVariant ||
            existingVariant.size !== variant.size ||
            existingVariant.color !== variant.color ||
            Number(existingVariant.price) !==
              variant.price ||
            existingVariant.stock !== variant.stock
          );
        })
      );

    if (variantsChanged) {
      const hasOrderHistory =
        await prisma.orderItem.findFirst({
          where: {
            variantId: {
              in: existingProduct.variants.map(
                (variant) => variant.id,
              ),
            },
          },
          select: {
            id: true,
          },
        });

      if (hasOrderHistory) {
        res.status(409).json({
          success: false,
          message:
            "Products with order history cannot have their variants changed",
        });

        return;
      }
    }

    const updatedProduct =
      await prisma.$transaction(async (tx) => {
        const product =
          await tx.product.update({
            where: {
              id: productId,
            },
            data: {
              ...(data.name !== undefined && {
                name: data.name,
              }),
              ...(data.slug !== undefined && {
                slug: data.slug,
              }),
              ...(data.sku !== undefined && {
                sku: data.sku,
              }),
              ...(data.description !==
                undefined && {
                description: data.description,
              }),
              ...(data.material !==
                undefined && {
                material: data.material,
              }),
              ...(data.color !== undefined && {
                color: data.color,
              }),
              ...(data.status !== undefined && {
                status: data.status,
              }),
              ...(data.basePrice !==
                undefined && {
                basePrice: data.basePrice,
              }),
              ...(data.discountPrice !==
                undefined && {
                discountPrice:
                  data.discountPrice,
              }),
              ...(data.isFeatured !==
                undefined && {
                isFeatured: data.isFeatured,
              }),
              ...(data.isNewArrival !==
                undefined && {
                isNewArrival:
                  data.isNewArrival,
              }),
              ...(data.isBestseller !==
                undefined && {
                isBestseller:
                  data.isBestseller,
              }),
              ...(data.categoryId !==
                undefined && {
                categoryId: data.categoryId,
              }),
              ...(data.ageGroups !==
                undefined && {
                ageGroups: data.ageGroups,
              }),
              ...(data.tags !== undefined && {
                tags: data.tags,
              }),
            },
          });

        if (data.images !== undefined) {
          await tx.productImage.deleteMany({
            where: {
              productId,
            },
          });

          if (data.images.length > 0) {
            await tx.productImage.createMany({
              data: data.images.map(
                (image) => ({
                  productId,
                  imageUrl: image.imageUrl,
                  altText: image.altText,
                  sortOrder:
                    image.sortOrder,
                  isPrimary:
                    image.isPrimary,
                }),
              ),
            });
          }
        }

        if (variantsChanged && data.variants !== undefined) {
          await tx.productVariant.deleteMany({
            where: {
              productId,
            },
          });

          await tx.productVariant.createMany({
            data: data.variants.map(
              (variant) => ({
                productId,
                size: variant.size,
                color: variant.color,
                sku: variant.sku,
                price: variant.price,
                stock: variant.stock,
              }),
            ),
          });
        }

        return tx.product.findUnique({
          where: {
            id: product.id,
          },
          include: {
            category: true,
            images: {
              orderBy: {
                sortOrder: "asc",
              },
            },
            variants: {
              orderBy: {
                size: "asc",
              },
            },
          },
        });
      });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error(
      "Failed to update admin product:",
      error,
    );

    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
}

export async function deleteAdminProduct(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const productId = req.params.id;

    if (
      typeof productId !== "string" ||
      productId.trim().length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "Product ID is required",
      });

      return;
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        variants: true,
      },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });

      return;
    }

    const variantIds = product.variants.map(
      (variant) => variant.id,
    );

    if (variantIds.length > 0) {
      const hasOrderHistory =
        await prisma.orderItem.findFirst({
          where: {
            variantId: {
              in: variantIds,
            },
          },
          select: {
            id: true,
          },
        });

      if (hasOrderHistory) {
        const updatedProduct =
          await prisma.product.update({
            where: {
              id: productId,
            },
            data: {
              status: "INACTIVE",
            },
          });

        res.status(200).json({
          success: true,
          message:
            "Product has order history, so it was deactivated instead of deleted",
          data: updatedProduct,
        });

        return;
      }
    }

    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(
      "Failed to delete admin product:",
      error,
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
}
