
import { useEffect } from "react";
import { Heart, Trash2 } from "lucide-react";
import { Link } from "react-router";
import ProductCard from "../components/product/ProductCard";
import { useWishlistStore } from "../store/wishlistStore";

function Wishlist() {
  const items = useWishlistStore(
    (state) => state.items,
  );

  const loading = useWishlistStore(
    (state) => state.loading,
  );

  const loadWishlist = useWishlistStore(
    (state) => state.loadWishlist,
  );

  const removeFromWishlist =
    useWishlistStore(
      (state) => state.removeFromWishlist,
    );

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  if (loading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center bg-[#FFF9ED]">
        <p className="text-sm text-black/60">
          Loading wishlist...
        </p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center bg-[#FFF9ED] px-4 py-16">
        <div className="text-center">
          <Heart
            size={42}
            strokeWidth={1.3}
            className="mx-auto text-[#C9A227]"
          />

          <h1 className="mt-5 text-3xl font-semibold tracking-tight">
            Your Wishlist Is Empty
          </h1>

          <p className="mt-3 text-sm text-black/60">
            Save your favourite traditional outfits here.
          </p>

          <Link
            to="/shop"
            className="mt-7 inline-flex bg-[#0B0B0B] px-7 py-3.5 text-sm font-semibold text-[#FFF9ED] transition hover:bg-[#D4AF37] hover:text-[#0B0B0B]"
          >
            Explore Collection
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#FFF9ED] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A227]">
              Your Favourites
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Wishlist
            </h1>

            <p className="mt-2 text-sm text-black/60">
              {items.length}{" "}
              {items.length === 1
                ? "item"
                : "items"}{" "}
              saved
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {items.map((product) => (
            <div
              key={product.id}
              className="relative"
            >
              <ProductCard product={product} />

              <button
                type="button"
                onClick={() =>
                  removeFromWishlist(
                    product.id,
                  )
                }
                aria-label={`Remove ${product.name} from wishlist`}
                className="mt-3 flex items-center gap-2 text-xs text-black/50 transition hover:text-red-600"
              >
                <Trash2 size={14} />
                Remove from wishlist
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Wishlist;

