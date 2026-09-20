// ===================================
// 4. PRODUCTCARD_IMPROVED.tsx
// ===================================
import {
  addWishlistItem,
  removeWishlistItem,
} from "../../services/wishlistService";
import { Check, Eye, Heart, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { Product } from "../../data/products";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";

type ProductCardProps = {
  product: Product;
};

function ProductCard({ product }: ProductCardProps) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showAddedMessage, setShowAddedMessage] = useState(false);

  const addToCart = useCartStore((state) => state.addToCart);
  const addToWishlist = useWishlistStore((state) => state.addToWishlist);
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id));

  const openQuickView = () => {
    setSelectedSize("");
    setQuantity(1);
    setIsQuickViewOpen(true);
  };

  const closeQuickView = () => {
    setIsQuickViewOpen(false);
    setSelectedSize("");
    setQuantity(1);
    setShowAddedMessage(false);
  };

  useEffect(() => {
    if (!showAddedMessage) return;
    const timer = window.setTimeout(() => setShowAddedMessage(false), 2500);
    return () => window.clearTimeout(timer);
  }, [showAddedMessage]);

const handleAddToCart = () => {
  if (!product || !selectedSize) {
    return;
  }

  addToCart(product, selectedSize, quantity);
  setShowAddedMessage(true);
};

const toggleWishlist = async () => {
  const variantId =
    product.variants.find((variant) => variant.stock > 0)?.id ??
    product.variants[0]?.id;

  if (!variantId) {
    return;
  }

  try {
    if (isInWishlist) {
      removeFromWishlist(product.id);
      await removeWishlistItem(variantId);
    } else {
      addToWishlist(product);
      await addWishlistItem(variantId);
    }
  } catch (error) {
    console.error("Wishlist sync failed:", error);
  }
};

  return (
    <>
      <article className="group">
        {/* Product Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gradient-to-br from-[#F7F3EA] to-[#F0E8D8] shadow-sm transition-all duration-500 group-hover:shadow-xl">
          <Link to={`/product/${product.slug}`} aria-label={`View ${product.name}`} className="block h-full w-full">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          </Link>

          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* Product Badges */}
          <div className="absolute left-3 top-3 flex gap-2 sm:left-4 sm:top-4">
            {product.newArrival && (
              <span className="inline-block animate-pulse bg-[#0B0B0B] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#FFF9ED] shadow-lg">
                ✨ New
              </span>
            )}

            {product.bestseller && !product.newArrival && (
              <span className="inline-block bg-gradient-to-r from-[#D4AF37] to-[#C9A227] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#0B0B0B] shadow-lg">
                ⭐ Bestseller
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={toggleWishlist}
            aria-label={isInWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            className={`absolute right-3 top-3 rounded-full p-3 shadow-lg backdrop-blur transition-all duration-300 active:scale-90 sm:right-4 sm:top-4 ${
              isInWishlist
                ? "bg-[#D4AF37] text-[#0B0B0B] hover:bg-[#C9A227]"
                : "bg-[#FFF9ED]/95 text-[#0B0B0B] hover:bg-[#D4AF37] hover:text-white"
            }`}
          >
            <Heart
              size={18}
              strokeWidth={1.7}
              fill={isInWishlist ? "currentColor" : "none"}
              className="transition-transform duration-300"
            />
          </button>

          {/* Quick View Button */}
          <button
            type="button"
            onClick={openQuickView}
            className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 rounded-xl bg-[#FFF9ED]/95 px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#0B0B0B] backdrop-blur transition-all duration-500 hover:bg-[#D4AF37] md:translate-y-16 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 sm:left-4 sm:right-4"
          >
            <Eye size={16} strokeWidth={2} />
            Quick View
          </button>
        </div>

        {/* Product Information */}
        <div className="pt-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A227] sm:text-xs">
            {product.category}
          </p>

          <Link to={`/product/${product.slug}`} className="block">
            <h2 className="mt-2.5 text-sm font-semibold leading-tight text-[#0B0B0B] transition-colors duration-300 hover:text-[#C9A227] sm:text-base">
              {product.name}
            </h2>
          </Link>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-base font-bold text-[#0B0B0B] sm:text-lg">
              ₹{product.price.toLocaleString("en-IN")}
            </span>

            {product.originalPrice && (
              <span className="text-xs text-[#0B0B0B]/40 line-through">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {product.originalPrice && (
            <p className="mt-2 inline-block text-xs font-bold text-white bg-[#D4AF37] px-2 py-1 rounded">
              {Math.round(
                ((product.originalPrice - product.price) / product.originalPrice) * 100
              )}
              % OFF
            </p>
          )}

          {/* Size Preview */}
          <div className="mt-3 hidden gap-1.5 sm:flex">
            {product.sizes.slice(0, 3).map((size) => (
              <span
                key={size}
                className="text-[10px] font-medium px-2 py-1 bg-[#F7F3EA] rounded border border-black/8"
              >
                {size}
              </span>
            ))}
            {product.sizes.length > 3 && (
              <span className="text-[10px] font-medium px-2 py-1 bg-[#F7F3EA] rounded border border-black/8">
                +{product.sizes.length - 3}
              </span>
            )}
          </div>
        </div>
      </article>


      {showAddedMessage && (
        <div className="fixed left-1/2 top-6 z-[110] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-xl border border-[#D4AF37]/40 bg-[#FFF9ED] px-4 py-3 shadow-xl" role="status">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D4AF37] text-[#0B0B0B]">
            <Check size={18} strokeWidth={2.5} />
          </span>
          <p className="flex-1 text-sm font-semibold text-[#0B0B0B]">Added to your cart</p>
          <Link to="/cart" onClick={() => setShowAddedMessage(false)} className="text-xs font-bold uppercase tracking-wide text-[#9A6B1F] hover:text-[#0B0B0B]">View cart</Link>
          <button type="button" onClick={() => setShowAddedMessage(false)} aria-label="Dismiss cart confirmation" className="text-black/45 hover:text-black"><X size={18} /></button>
        </div>
      )}
      {/* Quick View Modal */}
      {isQuickViewOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={`Quick view of ${product.name}`}
          onClick={closeQuickView}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto bg-[#FFF9ED] rounded-2xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={closeQuickView}
              aria-label="Close quick view"
              className="absolute right-4 top-4 z-10 rounded-full bg-[#FFF9ED] p-2.5 text-[#0B0B0B] shadow-lg transition-all duration-300 hover:bg-[#D4AF37] hover:shadow-xl active:scale-90"
            >
              <X size={20} strokeWidth={2} />
            </button>

            <div className="grid md:grid-cols-2">
              {/* Image Section */}
              <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-[#F7F3EA] to-[#F0E8D8] md:aspect-auto">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Details Section */}
              <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A227]">
                  {product.category}
                </p>

                <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#0B0B0B] sm:text-3xl lg:text-4xl">
                  {product.name}
                </h2>

                <div className="mt-5 flex flex-wrap items-baseline gap-4">
                  <span className="text-2xl font-bold text-[#0B0B0B] lg:text-3xl">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>

                  {product.originalPrice && (
                    <>
                      <span className="text-base text-black/40 line-through">
                        ₹{product.originalPrice.toLocaleString("en-IN")}
                      </span>

                      <span className="inline-block text-xs font-bold text-white bg-[#D4AF37] px-3 py-1.5 rounded">
                        {Math.round(
                          ((product.originalPrice - product.price) / product.originalPrice) * 100
                        )}
                        % OFF
                      </span>
                    </>
                  )}
                </div>

                <p className="mt-6 text-base leading-7 text-black/70">
                  Beautifully crafted {product.material.toLowerCase()} girlswear
                  designed for traditional celebrations and special occasions.
                </p>

                {/* Size Selection */}
                <div className="mt-8">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-bold uppercase tracking-wider text-[#0B0B0B]">
                      Select Size
                    </p>

                    <Link
                      to={`/product/${product.slug}`}
                      onClick={closeQuickView}
                      className="text-xs font-semibold text-[#C9A227] hover:text-[#0B0B0B] transition-colors"
                    >
                      Size Guide →
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-14 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                          selectedSize === size
                            ? "border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-[#0B0B0B] shadow-lg"
                            : "border-black/15 text-[#0B0B0B] hover:border-[#D4AF37] hover:bg-[#F7F3EA]"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  {!selectedSize && (
                    <p className="mt-3 text-xs text-black/50 italic">
                      Please select a size to continue.
                    </p>
                  )}
                </div>

                {/* Quantity Selection */}
                <div className="mt-8">
                  <p className="mb-4 text-sm font-bold uppercase tracking-wider text-[#0B0B0B]">
                    Quantity
                  </p>

                  <div className="flex w-fit items-center rounded-lg border-2 border-black/15 bg-[#F7F3EA]">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((current) =>
                          Math.max(1, current - 1)
                        )
                      }
                      className="flex h-12 w-12 items-center justify-center text-xl font-bold transition-all hover:bg-black/5 active:scale-95"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>

                    <span className="min-w-16 text-center text-lg font-semibold">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((current) => current + 1)
                      }
                      className="flex h-12 w-12 items-center justify-center text-xl font-bold transition-all hover:bg-black/5 active:scale-95"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-10 flex gap-4">
                  <button
                    type="button"
                    onClick={toggleWishlist}
                    aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-300 ${
                      isInWishlist
                        ? "border-[#D4AF37] bg-[#D4AF37] text-[#0B0B0B]"
                        : "border-black/15 text-[#0B0B0B] hover:border-[#D4AF37] hover:bg-[#F7F3EA]"
                    }`}
                  >
                    <Heart
                      size={20}
                      strokeWidth={1.7}
                      fill={isInWishlist ? "currentColor" : "none"}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!selectedSize}
                    className="flex-1 rounded-lg bg-gradient-to-r from-[#0B0B0B] to-[#1a1a1a] px-6 py-4 text-base font-bold text-[#FFF9ED] transition-all duration-300 hover:shadow-xl hover:shadow-black/20 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
                  >
                    Add to Cart
                  </button>
                </div>

                {/* Full Details Link */}
                <Link
                  to={`/product/${product.slug}`}
                  onClick={closeQuickView}
                  className="mt-6 text-center text-xs font-bold uppercase tracking-wider text-[#C9A227] underline underline-offset-4 transition-colors hover:text-[#0B0B0B]"
                >
                  View Full Product Details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductCard;