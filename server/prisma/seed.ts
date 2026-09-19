import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ProductStatus } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Starting database seed...");

  // ==================================================
  // CATEGORIES
  // ==================================================

  const cottonFrocks = await prisma.category.upsert({
    where: {
      slug: "cotton-frocks",
    },
    update: {},
    create: {
      name: "Cotton Frocks",
      slug: "cotton-frocks",
      description:
        "Comfortable traditional cotton frocks for little girls.",
      imageUrl: "/images/products/traditional-cotton-frock.jpg",
      sortOrder: 1,
    },
  });

  const pattuFrocks = await prisma.category.upsert({
    where: {
      slug: "pattu-frocks",
    },
    update: {},
    create: {
      name: "Pattu Frocks",
      slug: "pattu-frocks",
      description:
        "Festive pattu frocks inspired by South Indian traditions.",
      imageUrl: "/images/products/festive-pattu-frock.jpg",
      sortOrder: 2,
    },
  });

  const cottonPavadai = await prisma.category.upsert({
    where: {
      slug: "cotton-pavadai",
    },
    update: {},
    create: {
      name: "Cotton Pavadai",
      slug: "cotton-pavadai",
      description:
        "Traditional cotton pavadai sets for everyday occasions.",
      imageUrl: "/images/products/classic-cotton-pavadai.jpg",
      sortOrder: 3,
    },
  });

  const pattuPavadai = await prisma.category.upsert({
    where: {
      slug: "pattu-pavadai",
    },
    update: {},
    create: {
      name: "Pattu Pavadai",
      slug: "pattu-pavadai",
      description:
        "Elegant traditional pattu pavadai for celebrations.",
      imageUrl: "/images/products/festive-pattu-pavadai.jpg",
      sortOrder: 4,
    },
  });

  console.log("✅ Categories created");

  // ==================================================
  // PRODUCT 1 - TRADITIONAL COTTON FROCK
  // ==================================================

  await prisma.product.upsert({
    where: {
      slug: "traditional-cotton-frock",
    },
    update: {},
    create: {
      name: "Traditional Cotton Frock",
      slug: "traditional-cotton-frock",
      sku: "TCF-001",
      description:
        "A comfortable traditional cotton frock designed for everyday wear and small celebrations.",
      material: "Pure Cotton",
      color: "Ivory",
      status: ProductStatus.ACTIVE,

      basePrice: 799,
      discountPrice: null,

      isFeatured: true,
      isNewArrival: true,
      isBestseller: false,

      categoryId: cottonFrocks.id,

      ageGroups: [
        "Newborn",
        "0–2 Years",
        "2–4 Years",
        "4–6 Years",
        "6–8 Years",
        "8–10 Years",
      ],

      tags: [
        "cotton",
        "frock",
        "traditional",
        "everyday",
      ],

      images: {
        create: [
          {
            imageUrl:
              "/images/products/traditional-cotton-frock.jpg",
            altText: "Traditional Cotton Frock",
            sortOrder: 0,
            isPrimary: true,
          },
        ],
      },

      variants: {
        create: [
          {
            size: "NB",
            color: "Ivory",
            sku: "TCF-001-NB",
            price: 799,
            stock: 10,
          },
          {
            size: "0–2 Years",
            color: "Ivory",
            sku: "TCF-001-02Y",
            price: 799,
            stock: 10,
          },
          {
            size: "2–4 Years",
            color: "Ivory",
            sku: "TCF-001-24Y",
            price: 799,
            stock: 10,
          },
          {
            size: "4–6 Years",
            color: "Ivory",
            sku: "TCF-001-46Y",
            price: 799,
            stock: 10,
          },
          {
            size: "6–8 Years",
            color: "Ivory",
            sku: "TCF-001-68Y",
            price: 799,
            stock: 10,
          },
          {
            size: "8–10 Years",
            color: "Ivory",
            sku: "TCF-001-810Y",
            price: 799,
            stock: 10,
          },
        ],
      },
    },
  });

  // ==================================================
  // PRODUCT 2 - FESTIVE PATTU FROCK
  // ==================================================

  await prisma.product.upsert({
    where: {
      slug: "festive-pattu-frock",
    },
    update: {},
    create: {
      name: "Festive Pattu Frock",
      slug: "festive-pattu-frock",
      sku: "PFR-001",
      description:
        "A graceful pattu frock created for festive occasions, family celebrations and traditional events.",
      material: "Pattu Silk",
      color: "Gold",
      status: ProductStatus.ACTIVE,

      basePrice: 1099,
      discountPrice: null,

      isFeatured: true,
      isNewArrival: true,
      isBestseller: true,

      categoryId: pattuFrocks.id,

      ageGroups: [
        "Newborn",
        "0–2 Years",
        "2–4 Years",
        "4–6 Years",
        "6–8 Years",
        "8–10 Years",
      ],

      tags: [
        "pattu",
        "silk",
        "frock",
        "festive",
        "traditional",
      ],

      images: {
        create: [
          {
            imageUrl:
              "/images/products/festive-pattu-frock.jpg",
            altText: "Festive Pattu Frock",
            sortOrder: 0,
            isPrimary: true,
          },
        ],
      },

      variants: {
        create: [
          {
            size: "NB",
            color: "Gold",
            sku: "PFR-001-NB",
            price: 1099,
            stock: 10,
          },
          {
            size: "0–2 Years",
            color: "Gold",
            sku: "PFR-001-02Y",
            price: 1099,
            stock: 10,
          },
          {
            size: "2–4 Years",
            color: "Gold",
            sku: "PFR-001-24Y",
            price: 1099,
            stock: 10,
          },
          {
            size: "4–6 Years",
            color: "Gold",
            sku: "PFR-001-46Y",
            price: 1099,
            stock: 10,
          },
          {
            size: "6–8 Years",
            color: "Gold",
            sku: "PFR-001-68Y",
            price: 1099,
            stock: 10,
          },
          {
            size: "8–10 Years",
            color: "Gold",
            sku: "PFR-001-810Y",
            price: 1099,
            stock: 10,
          },
        ],
      },
    },
  });

  // ==================================================
  // PRODUCT 3 - CLASSIC COTTON PAVADAI
  // ==================================================

  await prisma.product.upsert({
    where: {
      slug: "classic-cotton-pavadai",
    },
    update: {},
    create: {
      name: "Classic Cotton Pavadai",
      slug: "classic-cotton-pavadai",
      sku: "CCP-001",
      description:
        "A classic cotton pavadai designed with comfort and timeless South Indian style.",
      material: "Pure Cotton",
      color: "Maroon",
      status: ProductStatus.ACTIVE,

      basePrice: 899,
      discountPrice: null,

      isFeatured: true,
      isNewArrival: false,
      isBestseller: true,

      categoryId: cottonPavadai.id,

      ageGroups: [
        "Newborn",
        "0–2 Years",
        "2–4 Years",
        "4–6 Years",
        "6–8 Years",
        "8–10 Years",
      ],

      tags: [
        "cotton",
        "pavadai",
        "traditional",
        "everyday",
      ],

      images: {
        create: [
          {
            imageUrl:
              "/images/products/classic-cotton-pavadai.jpg",
            altText: "Classic Cotton Pavadai",
            sortOrder: 0,
            isPrimary: true,
          },
        ],
      },

      variants: {
        create: [
          {
            size: "NB",
            color: "Maroon",
            sku: "CCP-001-NB",
            price: 899,
            stock: 10,
          },
          {
            size: "0–2 Years",
            color: "Maroon",
            sku: "CCP-001-02Y",
            price: 899,
            stock: 10,
          },
          {
            size: "2–4 Years",
            color: "Maroon",
            sku: "CCP-001-24Y",
            price: 899,
            stock: 10,
          },
          {
            size: "4–6 Years",
            color: "Maroon",
            sku: "CCP-001-46Y",
            price: 899,
            stock: 10,
          },
          {
            size: "6–8 Years",
            color: "Maroon",
            sku: "CCP-001-68Y",
            price: 899,
            stock: 10,
          },
          {
            size: "8–10 Years",
            color: "Maroon",
            sku: "CCP-001-810Y",
            price: 899,
            stock: 10,
          },
        ],
      },
    },
  });

  // ==================================================
  // PRODUCT 4 - FESTIVE PATTU PAVADAI
  // ==================================================

  await prisma.product.upsert({
    where: {
      slug: "festive-pattu-pavadai",
    },
    update: {},
    create: {
      name: "Festive Pattu Pavadai",
      slug: "festive-pattu-pavadai",
      sku: "PPP-001",
      description:
        "A premium traditional pattu pavadai designed for festivals, weddings and special celebrations.",
      material: "Pattu Silk",
      color: "Red",
      status: ProductStatus.ACTIVE,

      basePrice: 1099,
      discountPrice: null,

      isFeatured: true,
      isNewArrival: true,
      isBestseller: true,

      categoryId: pattuPavadai.id,

      ageGroups: [
        "Newborn",
        "0–2 Years",
        "2–4 Years",
        "4–6 Years",
        "6–8 Years",
        "8–10 Years",
      ],

      tags: [
        "pattu",
        "silk",
        "pavadai",
        "festive",
        "traditional",
      ],

      images: {
        create: [
          {
            imageUrl:
              "/images/products/festive-pattu-pavadai.jpg",
            altText: "Festive Pattu Pavadai",
            sortOrder: 0,
            isPrimary: true,
          },
        ],
      },

      variants: {
        create: [
          {
            size: "NB",
            color: "Red",
            sku: "PPP-001-NB",
            price: 1099,
            stock: 10,
          },
          {
            size: "0–2 Years",
            color: "Red",
            sku: "PPP-001-02Y",
            price: 1099,
            stock: 10,
          },
          {
            size: "2–4 Years",
            color: "Red",
            sku: "PPP-001-24Y",
            price: 1099,
            stock: 10,
          },
          {
            size: "4–6 Years",
            color: "Red",
            sku: "PPP-001-46Y",
            price: 1099,
            stock: 10,
          },
          {
            size: "6–8 Years",
            color: "Red",
            sku: "PPP-001-68Y",
            price: 1099,
            stock: 10,
          },
          {
            size: "8–10 Years",
            color: "Red",
            sku: "PPP-001-810Y",
            price: 1099,
            stock: 10,
          },
        ],
      },
    },
  });

  console.log("✅ Products created");
  console.log("✅ Product variants created");
  console.log("✅ Product images created");
  console.log("🎉 Database seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });