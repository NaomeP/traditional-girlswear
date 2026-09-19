
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  SlidersHorizontal,
} from "lucide-react";
import {
  useSearchParams,
} from "react-router";

import ProductCard from "../components/product/ProductCard";
import { getProducts } from "../services/productService";
import {
  mapApiProductToProduct,
  type Product,
} from "../data/products";

export default function Shop() {
  const [searchParams] = useSearchParams();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("All");

  const [ageGroup, setAgeGroup] =
    useState("All");

  const [size, setSize] =
    useState("All");

  const [material, setMaterial] =
    useState("All");

  const [color, setColor] =
    useState("All");

  /*
   * Read category from the URL.
   *
   * Example:
   * /shop?category=Cotton%20Frocks
   *
   * becomes:
   * Cotton Frocks
   */
  useEffect(() => {
    const categoryFromUrl =
      searchParams.get("category");

    if (categoryFromUrl) {
      setCategory(categoryFromUrl);
    } else {
      setCategory("All");
    }
  }, [searchParams]);

  /*
   * Load products from backend.
   */
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const apiProducts =
          await getProducts();

        const mappedProducts =
          apiProducts
            .filter(
              (product) =>
                product.status === "ACTIVE" ||
                product.status ===
                  "OUT_OF_STOCK",
            )
            .map(mapApiProductToProduct);

        setProducts(mappedProducts);
      } catch (err) {
        console.error(
          "Failed to load products:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load products",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  /*
   * Categories
   */
  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          products.map(
            (product) =>
              product.category,
          ),
        ),
      ),
    ];
  }, [products]);

  /*
   * Age groups
   */
  const ageGroups = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          products.flatMap(
            (product) =>
              product.ageGroups,
          ),
        ),
      ),
    ];
  }, [products]);

  /*
   * Sizes
   */
  const sizes = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          products.flatMap(
            (product) =>
              product.sizes,
          ),
        ),
      ),
    ];
  }, [products]);

  /*
   * Materials
   */
  const materials = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          products.map(
            (product) =>
              product.material,
          ),
        ),
      ),
    ];
  }, [products]);

  /*
   * Colors
   */
  const colors = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          products.map(
            (product) =>
              product.color,
          ),
        ),
      ),
    ];
  }, [products]);

  /*
   * Apply all filters.
   */
  const filteredProducts =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return products.filter(
        (product) => {
          const matchesSearch =
            searchValue === "" ||
            product.name
              .toLowerCase()
              .includes(searchValue) ||
            product.category
              .toLowerCase()
              .includes(searchValue) ||
            product.material
              .toLowerCase()
              .includes(searchValue) ||
            product.color
              .toLowerCase()
              .includes(searchValue);

          const matchesCategory =
            category === "All" ||
            product.category ===
              category;

          const matchesAge =
            ageGroup === "All" ||
            product.ageGroups.includes(
              ageGroup,
            );

          const matchesSize =
            size === "All" ||
            product.sizes.includes(
              size,
            );

          const matchesMaterial =
            material === "All" ||
            product.material ===
              material;

          const matchesColor =
            color === "All" ||
            product.color ===
              color;

          return (
            matchesSearch &&
            matchesCategory &&
            matchesAge &&
            matchesSize &&
            matchesMaterial &&
            matchesColor
          );
        },
      );
    }, [
      products,
      search,
      category,
      ageGroup,
      size,
      material,
      color,
    ]);

  /*
   * Clear all filters.
   */
  function clearFilters() {
    setSearch("");
    setCategory("All");
    setAgeGroup("All");
    setSize("All");
    setMaterial("All");
    setColor("All");
  }

  /*
   * Loading state.
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-white px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-gray-500">
            Loading products...
          </p>
        </div>
      </main>
    );
  }

  /*
   * Error state.
   */
  if (error) {
    return (
      <main className="min-h-screen bg-white px-4 py-12">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Unable to load products
          </h1>

          <p className="mt-3 text-gray-500">
            {error}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            Shop Girlswear
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Discover traditional South
            Indian styles for little ones.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search products..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
          />
        </div>

        {/* Filters */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal
                size={18}
                className="text-gray-700"
              />

              <h2 className="font-medium text-gray-900">
                Filters
              </h2>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-gray-700 underline"
            >
              Clear filters
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {/* Category */}
            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value,
                )
              }
              className="rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm"
            >
              {categories.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    Category: {item}
                  </option>
                ),
              )}
            </select>

            {/* Age */}
            <select
              value={ageGroup}
              onChange={(event) =>
                setAgeGroup(
                  event.target.value,
                )
              }
              className="rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm"
            >
              {ageGroups.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    Age: {item}
                  </option>
                ),
              )}
            </select>

            {/* Size */}
            <select
              value={size}
              onChange={(event) =>
                setSize(
                  event.target.value,
                )
              }
              className="rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm"
            >
              {sizes.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    Size: {item}
                  </option>
                ),
              )}
            </select>

            {/* Material */}
            <select
              value={material}
              onChange={(event) =>
                setMaterial(
                  event.target.value,
                )
              }
              className="rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm"
            >
              {materials.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    Material: {item}
                  </option>
                ),
              )}
            </select>

            {/* Color */}
            <select
              value={color}
              onChange={(event) =>
                setColor(
                  event.target.value,
                )
              }
              className="rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm"
            >
              {colors.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    Color: {item}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        {/* Product count */}
        <div className="mb-5">
          <p className="text-sm text-gray-500">
            {filteredProducts.length}{" "}
            {filteredProducts.length ===
            1
              ? "product"
              : "products"}
          </p>
        </div>

        {/* Products */}
        {filteredProducts.length ===
        0 ? (
          <div className="py-20 text-center">
            <h2 className="text-xl font-medium text-gray-900">
              No products found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Try changing your filters
              or search.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ),
            )}
          </div>
        )}
      </div>
    </main>
  );
}
