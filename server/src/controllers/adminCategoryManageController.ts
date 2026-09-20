import type { Request, Response } from "express";

import prisma from "../config/prisma";

export async function updateAdminCategory(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;

    const {
      name,
      slug,
      description,
      imageUrl,
      isActive,
      sortOrder,
    } = req.body;

    if (typeof id !== "string" || !id) {
      res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });

      return;
    }

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Category name is required",
      });

      return;
    }

    if (
      typeof slug !== "string" ||
      !slug.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Category slug is required",
      });

      return;
    }

    if (
      typeof sortOrder !== "number" ||
      !Number.isInteger(sortOrder) ||
      sortOrder < 0
    ) {
      res.status(400).json({
        success: false,
        message: "Sort order must be a non-negative integer",
      });

      return;
    }

    const existingCategory =
      await prisma.category.findUnique({
        where: {
          id,
        },
      });

    if (!existingCategory) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });

      return;
    }

    const duplicateCategory =
      await prisma.category.findFirst({
        where: {
          OR: [
            {
              name: name.trim(),
            },
            {
              slug: slug.trim(),
            },
          ],
          NOT: {
            id,
          },
        },
      });

    if (duplicateCategory) {
      res.status(409).json({
        success: false,
        message:
          duplicateCategory.name === name.trim()
            ? "Category name already exists"
            : "Category slug already exists",
      });

      return;
    }

    const updatedCategory =
      await prisma.category.update({
        where: {
          id,
        },

        data: {
          name: name.trim(),
          slug: slug.trim(),

          description:
            typeof description === "string" &&
            description.trim()
              ? description.trim()
              : null,
          imageUrl: typeof imageUrl === "string" && imageUrl.trim() ? imageUrl.trim() : null,

          isActive:
            typeof isActive === "boolean"
              ? isActive
              : existingCategory.isActive,

          sortOrder,
        },
      });

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error(
      "Failed to update admin category:",
      error,
    );

    res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
}

export async function deleteAdminCategory(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !id) {
      res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });

      return;
    }

    const category =
      await prisma.category.findUnique({
        where: {
          id,
        },

        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });

      return;
    }

    if (category._count.products > 0) {
      res.status(409).json({
        success: false,
        message:
          "Cannot delete a category that contains products",
      });

      return;
    }

    await prisma.category.delete({
      where: {
        id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error(
      "Failed to delete admin category:",
      error,
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
}
