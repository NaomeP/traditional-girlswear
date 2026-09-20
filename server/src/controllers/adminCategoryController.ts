import type { Request, Response } from "express";

import prisma from "../config/prisma";

export async function getAdminCategories(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error(
      "Failed to fetch admin categories:",
      error,
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
}

export async function createAdminCategory(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const {
      name,
      slug,
      description,
      imageUrl,
      isActive,
      sortOrder,
    } = req.body;

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
      sortOrder !== undefined &&
      (
        typeof sortOrder !== "number" ||
        !Number.isInteger(sortOrder) ||
        sortOrder < 0
      )
    ) {
      res.status(400).json({
        success: false,
        message:
          "Sort order must be a non-negative integer",
      });

      return;
    }

    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();

    const existingCategory =
      await prisma.category.findFirst({
        where: {
          OR: [
            {
              name: trimmedName,
            },
            {
              slug: trimmedSlug,
            },
          ],
        },
      });

    if (existingCategory) {
      res.status(409).json({
        success: false,
        message:
          existingCategory.name === trimmedName
            ? "Category name already exists"
            : "Category slug already exists",
      });

      return;
    }

    const category =
      await prisma.category.create({
        data: {
          name: trimmedName,
          slug: trimmedSlug,

          description:
            typeof description === "string" &&
            description.trim()
              ? description.trim()
              : null,
          imageUrl: typeof imageUrl === "string" && imageUrl.trim() ? imageUrl.trim() : null,

          isActive:
            typeof isActive === "boolean"
              ? isActive
              : true,

          sortOrder:
            typeof sortOrder === "number"
              ? sortOrder
              : 0,
        },
      });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error(
      "Failed to create admin category:",
      error,
    );

    res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
}
