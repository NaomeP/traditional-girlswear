
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Search,
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

  const [filtersOpen, setFiltersOpen] =
    useState(false);

  const [sort, setSort] =
    useState("featured");

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

    setSearch(searchParams.get("search") || "");
    setAgeGroup(searchParams.get("age") || "All");
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

  const visibleProducts = useMemo(() => {
    const productsToSort = [...filteredProducts];

    if (sort === "price-low") {
      return productsToSort.sort((first, second) => first.price - second.price);
    }

    if (sort === "price-high") {
      return productsToSort.sort((first, second) => second.price - first.price);
    }

    if (sort === "name") {
      return productsToSort.sort((first, second) => first.name.localeCompare(second.name));
    }

    return productsToSort;
  }, [filteredProducts, sort]);
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
      <div className="min-h-screen bg-[#fffaf1] px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[3/4] bg-[#f0e8d8]" />
                <div className="mt-4 h-3 w-20 bg-[#eadfca]" />
                <div className="mt-3 h-5 w-4/5 bg-[#eadfca]" />
                <div className="mt-3 h-4 w-1/3 bg-[#eadfca]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /*
   * Error state.
   */
  if (error) {
    return (
      <div className="min-h-screen bg-[#fffaf1] px-4 py-16">
        <div className="mx-auto max-w-xl border border-red-200 bg-white p-10 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b3533c]">Something went wrong</p>
          <h1 className="mt-3 text-2xl font-semibold text-[#24160f]">
            Unable to load products
          </h1>
          <p className="mt-3 text-sm text-black/55">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf1]">
      <div className="border-b border-[#24160f]/10 bg-[linear-gradient(115deg,#fff8e8,#f2e2bb)]">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#a56c25]">The Nila collection</p>
          <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#24160f] sm:text-4xl">Shop Girlswear</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-black/60 sm:text-base">Festive silhouettes and everyday comfort, crafted for little celebrations.</p>
            </div>
            <p className="rounded-full border border-[#c99b4a]/35 bg-[#fffaf1] px-4 py-2 text-xs font-semibold text-[#7b4b1a]">{products.length} styles to discover</p>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        {/* Search */}
        <div className="mb-5 rounded-xl border border-[#c99b4a]/35 bg-white p-1.5 shadow-[0_6px_20px_rgba(55,35,20,0.08)]">
          <div className="flex items-center gap-2 px-3">
            <Search size={20} className="shrink-0 text-[#8b541d]" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by style, colour or fabric..."
              className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-black/35"
            />
          </div>
        </div>
        {/* Filters */}
        <div className="mb-7 rounded-2xl border border-black/10 bg-white p-4 shadow-[0_8px_28px_rgba(55,35,20,0.06)] sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal
                size={18}
                className="text-[#a56c25]"
              />

              <h2 className="font-semibold text-[#24160f]">
                Filters
              </h2>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold uppercase tracking-wider text-[#a56c25] underline underline-offset-4"
            >
              Clear filters
            </button>
          </div>

          <button type="button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen} className="mb-4 w-full rounded-xl border border-black/10 px-4 py-3 text-left text-sm font-semibold text-[#24160f] sm:hidden">
            {filtersOpen ? "Hide filter options" : "Show filter options"}
          </button>

          <div className={`${filtersOpen ? "grid" : "hidden"} gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`}>
            {/* Category */}
            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value,
                )
              }
              className="rounded-xl border border-black/10 bg-[#fffaf1] px-3 py-3 text-sm text-[#24160f] outline-none focus:border-[#c99b4a]"
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
              className="rounded-xl border border-black/10 bg-[#fffaf1] px-3 py-3 text-sm text-[#24160f] outline-none focus:border-[#c99b4a]"
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
              className="rounded-xl border border-black/10 bg-[#fffaf1] px-3 py-3 text-sm text-[#24160f] outline-none focus:border-[#c99b4a]"
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
              className="rounded-xl border border-black/10 bg-[#fffaf1] px-3 py-3 text-sm text-[#24160f] outline-none focus:border-[#c99b4a]"
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
              className="rounded-xl border border-black/10 bg-[#fffaf1] px-3 py-3 text-sm text-[#24160f] outline-none focus:border-[#c99b4a]"
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
        <div className="mb-6 flex flex-col gap-3 border-b border-black/10 pb-4 min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between">
          <p className="text-sm text-black/55">
            {visibleProducts.length}{" "}
            {visibleProducts.length === 1 ? "product" : "products"}
            <span className="ml-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#a56c25]">available</span>
          </p>
          <label className="flex items-center gap-2 text-sm font-medium text-[#24160f]">
            Sort
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c99b4a] min-[480px]:w-48">
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </label>
        </div>
        {/* Products */}
        {visibleProducts.length ===
        0 ? (
          <div className="rounded-3xl border border-dashed border-[#c99b4a]/45 bg-[#f7f1e5] py-20 text-center">
            <h2 className="font-serif text-2xl font-semibold text-[#24160f]">
              No products found
            </h2>

            <p className="mt-2 text-sm text-black/55">
              Try changing your filters
              or search.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="btn-primary mt-6"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {visibleProducts.map(
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
    </div>
  );
}
