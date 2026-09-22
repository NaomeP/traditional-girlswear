import {
  Check,
  Heart,
  Minus,
  Plus,
  Ruler,
  Star,
  Truck,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import {
  mapApiProductToProduct,
  type Product,
} from "../data/products";

import { getProductBySlug } from "../services/productService";

import {
  createReview,
  getProductReviews,
  type Review,
  type ReviewResponse,
} from "../services/reviewService";

import { useCartStore } from "../store/cartStore";
import { useWishlistStore } from "../store/wishlistStore";

function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [showAddedMessage, setShowAddedMessage] = useState(false);

  // Review state
  const [reviewData, setReviewData] =
    useState<ReviewResponse | null>(null);

  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const [guestName, setGuestName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");

  const addToCart = useCartStore((state) => state.addToCart);

  const addToWishlist = useWishlistStore(
    (state) => state.addToWishlist,
  );

  const removeFromWishlist = useWishlistStore(
    (state) => state.removeFromWishlist,
  );

  const isInWishlist = useWishlistStore((state) =>
    product ? state.isInWishlist(product.id) : false,
  );
  const selectedVariant = product?.variants.find((variant) => variant.size === selectedSize);
  const availableStock = Number(selectedVariant?.stock ?? 0);
  const canAddSelectedVariant = availableStock > 0 && quantity <= availableStock;


  // Load product
  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      if (!slug) {
        setProduct(null);
        setLoadError("Product not found.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError("");

        const apiProduct = await getProductBySlug(slug);

        if (!isMounted) {
          return;
        }

        setProduct(mapApiProductToProduct(apiProduct));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("Failed to load product:", error);

        setProduct(null);
        setLoadError(
          error instanceof Error
            ? error.message
            : "Failed to load product.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Load reviews
  useEffect(() => {
    let isMounted = true;

    async function loadReviews() {
      if (!product) {
        return;
      }

      try {
        setIsReviewsLoading(true);
        setReviewError("");

        const data = await getProductReviews(product.id);

        if (isMounted) {
          setReviewData(data);
        }
      } catch (error) {
        if (isMounted) {
          setReviewError(
            error instanceof Error
              ? error.message
              : "Failed to load reviews.",
          );
        }
      } finally {
        if (isMounted) {
          setIsReviewsLoading(false);
        }
      }
    }

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, [product]);

  // Reset state when product changes
  useEffect(() => {
    setSelectedSize("");
    setQuantity(1);
    setShowAddedMessage(false);
    setIsSizeGuideOpen(false);

    setReviewData(null);
    setGuestName("");
    setReviewRating(5);
    setReviewComment("");
    setReviewError("");
    setReviewSuccess("");
  }, [slug]);

  // Hide cart message
  useEffect(() => {
    if (!showAddedMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowAddedMessage(false);
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [showAddedMessage]);

  // Refresh reviews
  const refreshReviews = async () => {
    if (!product) {
      return;
    }

    try {
      setIsReviewsLoading(true);
      setReviewError("");

      const data = await getProductReviews(product.id);
      setReviewData(data);
    } catch (error) {
      setReviewError(
        error instanceof Error
          ? error.message
          : "Failed to refresh reviews.",
      );
    } finally {
      setIsReviewsLoading(false);
    }
  };

  // Submit review
  const handleSubmitReview = async () => {
    if (!product) {
      return;
    }

    if (!guestName.trim()) {
      setReviewError("Please enter your name.");
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError("Please write your review.");
      return;
    }

    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError("Please select a rating.");
      return;
    }

    try {
      setIsSubmittingReview(true);
      setReviewError("");
      setReviewSuccess("");

      await createReview(product.id, {
        guestName: guestName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      setGuestName("");
      setReviewRating(5);
      setReviewComment("");
      setReviewSuccess("Thank you! Your review was submitted.");

      await refreshReviews();
    } catch (error) {
      setReviewError(
        error instanceof Error
          ? error.message
          : "Failed to submit review.",
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Quantity controls
  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  // Add to cart
  const handleAddToCart = () => {
    if (!product || !selectedSize || !canAddSelectedVariant) {
      return;
    }

    addToCart(product, selectedSize, quantity);
    setShowAddedMessage(true);
  };

  // Buy now
  const handleBuyNow = () => {
    if (!product || !selectedSize || !canAddSelectedVariant) {
      return;
    }

    addToCart(product, selectedSize, quantity);
    navigate("/checkout");
  };

  // Wishlist
  const toggleWishlist = () => {
    if (!product) {
      return;
    }

    if (isInWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center bg-[#FFF9ED] px-4">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-[#C9A227]" />

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
            Loading Product
          </p>

          <p className="mt-2 text-sm text-black/50">
            Please wait...
          </p>
        </div>
      </section>
    );
  }

  // Product not found
  if (!product) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center bg-[#FFF9ED] px-4">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
            404
          </p>

          <h1 className="mt-3 text-2xl font-semibold">
            Product not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-black/60">
            {loadError ||
              "The product you are looking for is unavailable."}
          </p>

          <Link
            to="/shop"
            className="mt-6 inline-flex bg-[#0B0B0B] px-6 py-3 text-sm font-semibold text-[#FFF9ED] transition hover:bg-[#C9A227] hover:text-[#0B0B0B]"
          >
            Back to Shop
          </Link>
        </div>
      </section>
    );
  }

  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) /
          product.originalPrice) *
          100,
      )
    : 0;

  const reviews = reviewData?.reviews ?? [];
  const totalReviews = reviewData?.total ?? 0;
  const averageRating = reviewData?.averageRating ?? 0;
  const ratingBreakdown = reviewData?.ratingBreakdown ?? {};

  return (
    <>
      <section className="min-h-screen bg-[#FFF9ED] px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumb */}
          <nav
            className="mb-8 overflow-hidden text-xs text-black/50"
            aria-label="Breadcrumb"
          >
            <div className="flex min-w-0 items-center">
              <Link
                to="/"
                className="shrink-0 transition hover:text-[#C9A227]"
              >
                Home
              </Link>

              <span className="mx-2 shrink-0">/</span>

              <Link
                to="/shop"
                className="shrink-0 transition hover:text-[#C9A227]"
              >
                Shop
              </Link>

              <span className="mx-2 shrink-0">/</span>

              <span className="truncate text-black/70">
                {product.name}
              </span>
            </div>
          </nav>

          {/* Product section */}
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Product image */}
            <div className="relative">
              <div className="aspect-[3/4] overflow-hidden rounded-3xl bg-[#F7F3EA]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {product.newArrival && (
                <span className="absolute left-4 top-4 bg-[#0B0B0B] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#FFF9ED]">
                  New
                </span>
              )}

              {product.bestseller && !product.newArrival && (
                <span className="absolute left-4 top-4 bg-[#D4AF37] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#0B0B0B]">
                  Bestseller
                </span>
              )}
            </div>

            {/* Product information */}
            <div className="lg:py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A227]">
                {product.category}
              </p>

              <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-[#24160f] sm:text-4xl">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="text-xl font-semibold text-[#0B0B0B]">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>

                {product.originalPrice && (
                  <>
                    <span className="text-sm text-black/40 line-through">
                      ₹
                      {product.originalPrice.toLocaleString("en-IN")}
                    </span>

                    <span className="bg-[#D4AF37]/15 px-2 py-1 text-xs font-semibold text-[#9A7814]">
                      {discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Product rating preview */}
              <div className="mt-4 flex items-center gap-2">
                <div className="flex items-center gap-1 text-[#C9A227]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      size={16}
                      fill={
                        index < Math.round(averageRating)
                          ? "currentColor"
                          : "none"
                      }
                      strokeWidth={1.6}
                    />
                  ))}
                </div>

                <span className="text-sm text-black/60">
                  {reviewData
                    ? `${averageRating.toFixed(1)} (${totalReviews} reviews)`
                    : "No reviews yet"}
                </span>
              </div>

              <div className="my-8 h-px bg-black/10" />

              {/* Product details */}
              <div className="grid grid-cols-2 gap-5 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-black/40">
                    Material
                  </p>

                  <p className="mt-1.5 font-medium text-[#0B0B0B]">
                    {product.material}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-black/40">
                    Color
                  </p>

                  <p className="mt-1.5 font-medium text-[#0B0B0B]">
                    {product.color}
                  </p>
                </div>
              </div>

              {/* Size */}
              <div className="mt-8">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold">
                    Select Size
                  </p>

                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C9A227] underline underline-offset-4 transition hover:text-[#0B0B0B]"
                  >
                    <Ruler size={14} strokeWidth={1.7} />
                    Size Guide
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={selectedSize === size}
                      className={`min-h-12 rounded-xl border px-3 py-3 text-sm font-medium transition ${
                        selectedSize === size
                          ? "border-[#0B0B0B] bg-[#0B0B0B] text-[#FFF9ED]"
                          : "border-black/15 bg-transparent hover:border-[#C9A227]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {!selectedSize && (
                  <p className="mt-2 text-xs text-black/45">
                    Please select a size to continue.
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="mt-8">
                <p className="text-sm font-semibold">Quantity</p>

                <div className="mt-3 flex w-fit items-center rounded-full border border-black/15">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    aria-label="Decrease quantity"
                    className="flex h-12 w-12 items-center justify-center transition hover:bg-black/5"
                  >
                    <Minus size={16} strokeWidth={1.7} />
                  </button>

                  <span className="min-w-12 text-center text-sm font-medium">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    aria-label="Increase quantity"
                    className="flex h-12 w-12 items-center justify-center transition hover:bg-black/5"
                  >
                    <Plus size={16} strokeWidth={1.7} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!selectedSize || !canAddSelectedVariant}
                  className="flex-1 rounded-full bg-[#24160f] px-5 py-4 text-sm font-semibold text-[#fffaf1] transition hover:bg-[#3a2418] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {selectedSize && !canAddSelectedVariant ? "Out of Stock" : "Add to Cart"}
                </button>

                <button
                  type="button"
                  onClick={toggleWishlist}
                  aria-label={
                    isInWishlist
                      ? `Remove ${product.name} from wishlist`
                      : `Add ${product.name} to wishlist`
                  }
                  aria-pressed={isInWishlist}
                  className={`flex h-14 w-14 shrink-0 items-center justify-center border transition ${
                    isInWishlist
                      ? "border-[#D4AF37] bg-[#D4AF37] text-[#0B0B0B]"
                      : "border-black/15 hover:border-[#C9A227] hover:bg-[#D4AF37]"
                  }`}
                >
                  <Heart
                    size={20}
                    strokeWidth={1.7}
                    fill={isInWishlist ? "currentColor" : "none"}
                  />
                </button>
              </div>

              {/* Added message */}
              {showAddedMessage && (
                <div className="mt-3 flex items-center gap-2 border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-3 text-sm">
                  <Check
                    size={17}
                    strokeWidth={1.8}
                    className="text-[#9A7814]"
                  />

                  <span>
                    Added to cart — {selectedSize}, quantity{" "}
                    {quantity}.
                  </span>

                  <Link
                    to="/cart"
                    className="ml-auto shrink-0 text-xs font-semibold underline underline-offset-4"
                  >
                    View Cart
                  </Link>
                </div>
              )}

              {/* Buy now */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!selectedSize || !canAddSelectedVariant}
                className="mt-3 w-full bg-[#D4AF37] px-5 py-4 text-sm font-semibold text-[#0B0B0B] transition hover:bg-[#C9A227] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {selectedSize && !canAddSelectedVariant ? "Out of Stock" : "Buy Now"}
              </button>

              {/* Shipping */}
              <div className="mt-8 border-t border-black/10 pt-6">
                <div className="flex gap-3">
                  <Truck
                    size={20}
                    strokeWidth={1.6}
                    className="mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="text-sm font-semibold">
                      Delivery & Shipping
                    </p>

                    <p className="mt-1 text-xs leading-5 text-black/60">
                      Enter your delivery address at checkout to
                      view available shipping options and estimated
                      delivery time.
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-8 border-t border-black/10 pt-6">
                <h2 className="text-sm font-semibold">
                  Description
                </h2>

                <p className="mt-3 text-sm leading-7 text-black/60">
                  {product.name} is a beautifully designed
                  traditional girlswear piece created for
                  celebrations, family occasions, and timeless
                  memories.
                </p>
              </div>

              {/* Material & Care */}
              <div className="mt-6 border-t border-black/10 pt-6">
                <h2 className="text-sm font-semibold">
                  Material & Care
                </h2>

                <p className="mt-3 text-sm leading-7 text-black/60">
                  Made with {product.material}. Follow the final
                  product care instructions provided with your
                  order.
                </p>
              </div>

              {/* Available Sizes */}
              <div className="mt-6 border-t border-black/10 pt-6">
                <h2 className="text-sm font-semibold">
                  Available Sizes
                </h2>

                <p className="mt-3 text-sm leading-7 text-black/60">
                  Available sizes: {product.sizes.join(", ")}.
                </p>
              </div>
            </div>
          </div>

          {/* Reviews section */}
          <section className="mt-16 border-t border-black/10 pt-12">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              {/* Review summary */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
                  Customer Feedback
                </p>

                <h2 className="mt-3 text-3xl font-semibold">
                  Reviews & Ratings
                </h2>

                <div className="mt-6 border border-black/10 bg-[#F7F3EA] p-6">
                  <p className="text-5xl font-semibold">
                    {averageRating.toFixed(1)}
                  </p>

                  <div className="mt-3 flex gap-1 text-[#C9A227]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        size={18}
                        fill={
                          index < Math.round(averageRating)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    ))}
                  </div>

                  <p className="mt-2 text-sm text-black/60">
                    Based on {totalReviews} reviews
                  </p>

                  <div className="mt-6 space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count =
                        ratingBreakdown[rating] || 0;

                      const percentage = totalReviews
                        ? (count / totalReviews) * 100
                        : 0;

                      return (
                        <div
                          key={rating}
                          className="flex items-center gap-3 text-xs"
                        >
                          <span className="w-10">
                            {rating} ★
                          </span>

                          <div className="h-2 flex-1 bg-black/10">
                            <div
                              className="h-2 bg-[#C9A227]"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>

                          <span className="w-6 text-right text-black/50">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Submit review */}
                <div className="mt-8 border border-black/10 bg-white/40 p-6">
                  <h3 className="text-lg font-semibold">
                    Write a Review
                  </h3>

                  <p className="mt-2 text-sm text-black/60">
                    Share your experience with this product.
                  </p>

                  <label className="mt-5 block text-sm font-medium">
                    Your Name
                  </label>

                  <input
                    type="text"
                    value={guestName}
                    onChange={(event) =>
                      setGuestName(event.target.value)
                    }
                    placeholder="Enter your name"
                    className="mt-2 w-full border border-black/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-[#C9A227]"
                  />

                  <label className="mt-5 block text-sm font-medium">
                    Your Rating
                  </label>

                  <div className="mt-2 flex gap-1">
                    {Array.from({ length: 5 }).map((_, index) => {
                      const rating = index + 1;

                      return (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setReviewRating(rating)}
                          aria-label={`Give ${rating} stars`}
                          className="p-1"
                        >
                          <Star
                            size={24}
                            fill={
                              rating <= reviewRating
                                ? "currentColor"
                                : "none"
                            }
                            className="text-[#C9A227]"
                          />
                        </button>
                      );
                    })}
                  </div>

                  <label className="mt-5 block text-sm font-medium">
                    Your Review
                  </label>

                  <textarea
                    value={reviewComment}
                    onChange={(event) =>
                      setReviewComment(event.target.value)
                    }
                    placeholder="Write your review..."
                    rows={4}
                    className="mt-2 w-full resize-none border border-black/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-[#C9A227]"
                  />

                  {reviewError && (
                    <p className="mt-3 text-sm text-red-600">
                      {reviewError}
                    </p>
                  )}

                  {reviewSuccess && (
                    <p className="mt-3 text-sm text-green-700">
                      {reviewSuccess}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmitReview}
                    disabled={isSubmittingReview}
                    className="mt-5 w-full bg-[#0B0B0B] px-5 py-3 text-sm font-semibold text-[#FFF9ED] transition hover:bg-[#C9A227] hover:text-[#0B0B0B] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmittingReview
                      ? "Submitting..."
                      : "Submit Review"}
                  </button>
                </div>
              </div>

              {/* Review list */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">
                    Customer Reviews
                  </h3>

                  <span className="text-sm text-black/50">
                    {totalReviews} reviews
                  </span>
                </div>

                {isReviewsLoading && (
                  <p className="mt-6 text-sm text-black/50">
                    Loading reviews...
                  </p>
                )}

                {!isReviewsLoading && reviewError && (
                  <p className="mt-6 text-sm text-red-600">
                    {reviewError}
                  </p>
                )}

                {!isReviewsLoading &&
                  !reviewError &&
                  reviews.length === 0 && (
                    <div className="mt-6 border border-dashed border-black/20 p-8 text-center">
                      <p className="text-sm text-black/60">
                        No reviews yet. Be the first to review this
                        product.
                      </p>
                    </div>
                  )}

                <div className="mt-6 space-y-5">
                  {reviews.map((review: Review) => (
                    <article
                      key={review.id}
                      className="border-b border-black/10 pb-6"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">
                            {review.guestName}
                          </p>

                          <p className="mt-1 text-xs text-black/45">
                            {new Date(
                              review.createdAt,
                            ).toLocaleDateString("en-IN")}
                          </p>
                        </div>

                        <div className="flex gap-1 text-[#C9A227]">
                          {Array.from({ length: 5 }).map(
                            (_, index) => (
                              <Star
                                key={index}
                                size={15}
                                fill={
                                  index < review.rating
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            ),
                          )}
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-7 text-black/70">
                        {review.comment}
                      </p>

                     {review.replies && review.replies.length > 0 && (
  <div className="mt-4 border-l-2 border-[#C9A227] bg-[#F7F3EA] p-4">
    <p className="text-xs font-semibold uppercase tracking-wider text-[#9A7814]">
      Response from the store
    </p>

    <div className="mt-2 space-y-3">
      {review.replies.map((reply) => (
        <div key={reply.id}>
          <p className="text-sm leading-6 text-black/70">
            {reply.message}
          </p>

          {reply.admin?.name && (
            <p className="mt-1 text-xs text-black/45">
              {reply.admin.name}
            </p>
          )}
        </div>
      ))}
    </div>
  </div>
)}
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="size-guide-title"
          onClick={() => setIsSizeGuideOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto bg-[#FFF9ED] p-6 sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsSizeGuideOpen(false)}
              aria-label="Close size guide"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/5"
            >
              <X size={20} strokeWidth={1.7} />
            </button>

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
              Size Guide
            </p>

            <h2
              id="size-guide-title"
              className="mt-3 text-2xl font-semibold"
            >
              Find the right fit
            </h2>

            <p className="mt-3 text-sm leading-6 text-black/60">
              The final measurement chart will be added once the
              brand's official size measurements are provided.
            </p>

            <div className="mt-7 overflow-hidden border border-black/10">
              <div className="grid grid-cols-2 bg-[#F7F3EA] px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                <span>Size</span>
                <span>Age Reference</span>
              </div>

              {product.sizes.map((size) => {
                let ageReference = "Age-based sizing";

                if (size === "NB") {
                  ageReference = "Newborn";
                } else if (size === "0–2 Years") {
                  ageReference = "0–2 years";
                } else if (size === "2–4 Years") {
                  ageReference = "2–4 years";
                } else if (size === "4–6 Years") {
                  ageReference = "4–6 years";
                } else if (size === "6–8 Years") {
                  ageReference = "6–8 years";
                } else if (size === "8–10 Years") {
                  ageReference = "8–10 years";
                }

                return (
                  <div
                    key={size}
                    className="grid grid-cols-2 border-t border-black/10 px-4 py-3 text-sm"
                  >
                    <span className="font-medium">{size}</span>

                    <span className="text-black/60">
                      {ageReference}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="mt-5 text-xs leading-5 text-black/50">
              Please use the official measurement chart once it is
              available. Age references are only a general guide and
              may vary by child.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductDetails;