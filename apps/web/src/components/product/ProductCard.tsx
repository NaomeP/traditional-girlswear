// ===================================
// 4. PRODUCTCARD_IMPROVED.tsx
// ===================================
import {
  addWishlistItem,
  removeWishlistItem,
} from "../../services/wishlistService";
import { Check, Eye, Heart, ShoppingBag, X } from "lucide-react";
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

const handleQuickAdd = () => {
  const firstAvailableVariant = product.variants.find(
    (variant) => Number(variant.stock) > 0,
  );

  if (!firstAvailableVariant) {
    openQuickView();
    return;
  }

  addToCart(product, firstAvailableVariant.size, 1);
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
      <article className="group flex h-full flex-col bg-white transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(44,28,14,0.12)]">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#f4f1ec]">
          <Link to={`/product/${product.slug}`} aria-label={`View ${product.name}`} className="block h-full w-full">
            <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
          </Link>

          {(product.newArrival || product.bestseller) && (
            <span className="absolute left-2 top-2 bg-[#24160f] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#fffaf1]">
              {product.newArrival ? "New" : "Bestseller"}
            </span>
          )}

          <button
            type="button"
            onClick={toggleWishlist}
            aria-label={isInWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            className={`absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition ${isInWishlist ? "bg-[#f6d77c] text-[#24160f]" : "bg-white/95 text-[#24160f] hover:bg-[#f6d77c]"}`}
          >
            <Heart size={17} strokeWidth={1.8} fill={isInWishlist ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="flex flex-1 flex-col px-3 pb-3 pt-3 sm:px-4 sm:pb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8b541d]">{product.category}</p>
          <Link to={`/product/${product.slug}`} className="mt-1 block">
            <h2 className="line-clamp-2 min-h-10 text-sm font-medium leading-5 text-[#17130e] hover:text-[#a56c25] sm:text-base">{product.name}</h2>
          </Link>
          <p className="mt-2 text-xs text-black/55">{product.material} · {product.color}</p>

          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-xl font-semibold tracking-tight text-[#17130e]">₹{product.price.toLocaleString("en-IN")}</span>
            {product.originalPrice && <span className="text-xs text-black/45 line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>}
          </div>

          {product.originalPrice && (
            <p className="mt-1 text-xs font-semibold text-[#a56c25]">
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
            </p>
          )}

          <p className="mt-3 text-xs text-[#3c3329]"><span className="font-semibold">Free delivery</span> on eligible orders</p>

          <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
            <button type="button" onClick={handleQuickAdd} className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#f6d77c] px-3 text-sm font-semibold text-[#24160f] transition hover:bg-[#e9c45d] active:scale-[0.98]">
              <ShoppingBag size={16} /> Add to cart
            </button>
            <button type="button" onClick={openQuickView} aria-label={`Choose size for ${product.name}`} className="rounded-full border border-black/15 px-3 text-xs font-semibold text-[#24160f] hover:border-[#a56c25]">
              <Eye size={17} />
            </button>
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