
import { Eye, Heart, ShoppingBag } from "lucide-react";
import { mapApiProductToProduct } from "../../data/products";
import { useCartStore } from "../../store/cartStore";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { optimizedImageUrl } from "../../utils/optimizedImageUrl";

import {
  getProducts,
  type Product,
} from "../../services/productService";

import {
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
} from "../../services/wishlistService";

function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [wishlistVariantIds, setWishlistVariantIds] =
    useState<Set<string>>(new Set());

  const [wishlistLoading, setWishlistLoading] =
    useState<string | null>(null);
  const [cartAddedProduct, setCartAddedProduct] = useState<string | null>(null);
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts();

        const featuredProducts = data.filter(
          (product) =>
            product.status === "ACTIVE" &&
            product.isFeatured === true,
        );

        setProducts(featuredProducts);
      } catch (error) {
        console.error(
          "Failed to load featured products:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load featured products",
        );
      } finally {
        setLoading(false);
      }
    }

    async function loadWishlist(): Promise<void> {
      try {
        const wishlist = await getWishlist();

        setWishlistVariantIds(
          new Set(
            wishlist.map(
              (item) => item.variantId,
            ),
          ),
        );
      } catch (error) {
        console.error(
          "Failed to load wishlist:",
          error,
        );
      }
    }

    void loadProducts();
    void loadWishlist();
  }, []);

  useEffect(() => {
    if (!cartAddedProduct) return;
    const timer = window.setTimeout(() => setCartAddedProduct(null), 1800);
    return () => window.clearTimeout(timer);
  }, [cartAddedProduct]);

  function handleAddToCart(product: Product): void {
    const variant = product.variants?.find((item) => Number(item.stock) > 0);
    if (!variant) return;
    addToCart(mapApiProductToProduct(product), variant.size, 1);
    setCartAddedProduct(product.id);
  }

  function getWishlistVariantId(
    product: Product,
  ): string | null {
    const availableVariant =
      product.variants?.find(
        (variant) => Number(variant.stock) > 0,
      ) ?? product.variants?.[0];

    return availableVariant?.id ?? null;
  }

  function isProductInWishlist(
    product: Product,
  ): boolean {
    return (
      product.variants?.some((variant) =>
        wishlistVariantIds.has(variant.id),
      ) ?? false
    );
  }

  async function handleWishlistClick(
    product: Product,
  ): Promise<void> {
    if (wishlistLoading === product.id) {
      return;
    }

    const variantId =
      getWishlistVariantId(product);

    if (!variantId) {
      window.alert(
        "This product is currently unavailable.",
      );

      return;
    }

    try {
      setWishlistLoading(product.id);

      const alreadyInWishlist =
        isProductInWishlist(product);

      if (alreadyInWishlist) {
        const wishlistVariant =
          product.variants?.find((variant) =>
            wishlistVariantIds.has(
              variant.id,
            ),
          );

        if (!wishlistVariant) {
          return;
        }

        await removeWishlistItem(
          wishlistVariant.id,
        );

        setWishlistVariantIds((current) => {
          const next = new Set(current);

          next.delete(
            wishlistVariant.id,
          );

          return next;
        });
      } else {
        const addedItem =
          await addWishlistItem(variantId);

        setWishlistVariantIds((current) => {
          const next = new Set(current);

          next.add(addedItem.variantId);

          return next;
        });
      }
    } catch (error) {
      console.error(
        "Wishlist action failed:",
        error,
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Please login to use the wishlist.",
      );
    } finally {
      setWishlistLoading(null);
    }
  }

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-[#fffaf1] via-[#fffaf1] to-[#f8f1e4] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <div className="absolute -right-20 -top-40 h-96 w-96 rounded-full bg-[#D4AF37]/8 blur-3xl" />

      <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#C9A227]/8 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C9A227]">
              Featured Collection
            </p>

            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-[#24160f] sm:text-4xl">
              Little looks,
              <br />
              timeless charm
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#0B0B0B]/65 sm:text-base sm:leading-7">
              Explore our carefully selected traditional
              styles, created for celebrations and
              cherished moments.
            </p>
          </div>

          <Link
            to="/shop"
            className="group inline-flex w-fit items-center gap-3 text-sm font-bold uppercase tracking-[0.15em] text-[#0B0B0B] transition-colors hover:text-[#C9A227]"
          >
            <ShoppingBag size={18} />

            <span>View All Products</span>

            <span className="h-0.5 w-0 bg-[#C9A227] transition-all group-hover:w-4" />
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[4/5] rounded-xl bg-[#f0e8d8] sm:aspect-[3/4] sm:rounded-2xl" />
                <div className="mt-4 h-3 w-20 rounded bg-[#eadfca]" />
                <div className="mt-3 h-5 w-3/4 rounded bg-[#eadfca]" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <h3 className="text-lg font-semibold text-red-800">
              Unable to load featured products
            </h3>

            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          products.length === 0 && (
            <div className="rounded-2xl border border-[#D4AF37]/20 bg-white/60 p-12 text-center">
              <h3 className="text-xl font-bold text-[#0B0B0B]">
                No featured products yet
              </h3>

              <p className="mt-3 text-sm text-[#0B0B0B]/60">
                Products marked as featured in the admin
                panel will appear here.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          products.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {products.map((product, index) => {
                const primaryImage =
                  product.images.find(
                    (image) => image.isPrimary,
                  ) ??
                  product.images[0];

                const price = Number(
                  product.discountPrice ??
                    product.basePrice,
                );

                const originalPrice =
                  product.discountPrice !== null
                    ? Number(product.basePrice)
                    : null;

                const isWishlisted =
                  isProductInWishlist(product);

                const isWishlistActionLoading =
                  wishlistLoading === product.id;

                return (
                  <article
                    key={product.id}
                    className="group"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-gradient-to-br from-[#F7F3EA] to-[#F0E8D8] shadow-sm transition-all duration-500 group-hover:shadow-lg sm:aspect-[3/4] sm:rounded-2xl">
                      <Link
                        to={`/product/${product.slug}`}
                      >
                        {primaryImage?.imageUrl ? (
                          <img
                            src={optimizedImageUrl(primaryImage.imageUrl, 700)}
                            loading="lazy"
                            fetchPriority={index < 2 ? "high" : "auto"}
                            decoding="async"
                            alt={
                              primaryImage.altText ||
                              product.name
                            }
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                            No image available
                          </div>
                        )}
                      </Link>

                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                      {(product.isNewArrival ||
                        product.isBestseller) && (
                        <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
                          <span className="rounded bg-gradient-to-r from-[#D4AF37] to-[#C9A227] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#0B0B0B] shadow-lg">
                            {product.isBestseller
                              ? "Bestseller"
                              : "New"}
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        aria-label={
                          isWishlisted
                            ? `Remove ${product.name} from wishlist`
                            : `Add ${product.name} to wishlist`
                        }
                        disabled={
                          isWishlistActionLoading
                        }
                        onClick={() =>
                          void handleWishlistClick(
                            product,
                          )
                        }
                        className={`absolute right-3 top-3 rounded-full p-2.5 shadow-lg transition-all sm:right-4 sm:top-4 ${
                          isWishlisted
                            ? "bg-[#f6d77c] text-[#24160f]"
                            : "bg-[#FFF9ED]/95 text-[#24160f] hover:bg-[#f6d77c]"
                        } ${
                          isWishlistActionLoading
                            ? "cursor-wait opacity-60"
                            : ""
                        }`}
                      >
                        <Heart
                          size={18}
                          strokeWidth={1.7}
                          className={
                            isWishlisted
                              ? "fill-current"
                              : ""
                          }
                        />
                      </button>
                    </div>

                    <div className="mt-3 sm:mt-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C9A227] sm:text-xs">
                        {product.category.name}
                      </p>

                      <Link
                        to={`/product/${product.slug}`}
                      >
                        <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-tight text-[#0B0B0B] transition-colors hover:text-[#C9A227] sm:mt-2.5 sm:text-base">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="mt-2 flex items-center gap-2 sm:mt-3">
                        <p className="text-base font-bold text-[#0B0B0B] sm:text-lg">
                          ₹
                          {price.toLocaleString(
                            "en-IN",
                          )}
                        </p>

                        {originalPrice !== null &&
                          originalPrice > price && (
                            <p className="text-xs text-[#0B0B0B]/45 line-through sm:text-sm">
                              ₹
                              {originalPrice.toLocaleString(
                                "en-IN",
                              )}
                            </p>
                          )}
                      </div>

                      <div className="mt-3 grid grid-cols-[1fr_auto] gap-2 sm:mt-4">
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.variants?.some((variant) => Number(variant.stock) > 0)}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#f6d77c] px-3 text-sm font-semibold text-[#24160f] transition hover:bg-[#e9c45d] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <ShoppingBag size={16} />
                          {cartAddedProduct === product.id ? "Added to cart" : product.variants?.some((variant) => Number(variant.stock) > 0) ? "Add to cart" : "Sold out"}
                        </button>
                        <Link
                          to={`/product/${product.slug}`}
                          aria-label={`View ${product.name}`}
                          title="View product"
                          className="inline-flex h-10 w-11 items-center justify-center rounded-lg border border-[#24160f]/20 text-[#24160f] transition hover:border-[#a56c25] hover:bg-white/60"
                        >
                          <Eye size={18} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
      </div>
    </section>
  );
}

export default FeaturedProducts;

