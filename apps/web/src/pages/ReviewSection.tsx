import React, { useEffect, useState } from "react";

import {
  Star,
  Send,
  User,
  MessageCircle,
  Loader2,
} from "lucide-react";

import {
  createReview,
  getProductReviews,
} from "../services/reviewService";

import type {
  Review,
  ReviewResponse,
} from "../services/reviewService";

interface ReviewSectionProps {
  productId: string;
}
const ReviewSection: React.FC<ReviewSectionProps> = ({ productId }) => {
  const [reviewsData, setReviewsData] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [guestName, setGuestName] = useState<string>("");

  const [hoverRating, setHoverRating] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const loadReviews = async (): Promise<void> => {
    console.log("LOAD REVIEWS FUNCTION RUNNING");
    try {
      setLoading(true);
      setError("");

      const data = await getProductReviews(productId);
      console.log("REVIEWS DATA:", data);
console.log("REVIEWS LIST:", data.reviews);
      setReviewsData(data);
    } catch (err) {
      setError("Unable to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

 const handleSubmitReview = async (
  event: React.FormEvent<HTMLFormElement>
): Promise<void> => {
  event.preventDefault();

  if (!guestName.trim()) {
    setError("Please enter your name.");
    return;
  }

  if (rating === 0) {
    setError("Please select a rating.");
    return;
  }

  if (!comment.trim()) {
    setError("Please enter your review.");
    return;
  }

  try {
    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    // Save the review only once
    await createReview(productId, {
      rating,
      comment: comment.trim(),
      guestName: guestName.trim(),
    });

    // Fetch the updated reviews
    await loadReviews();

    // Clear the form
    setRating(0);
    setHoverRating(0);
    setComment("");
    setGuestName("");

    setSuccessMessage("Your review was submitted successfully.");
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to submit your review."
    );
  } finally {
    setSubmitting(false);
  }
};
  const renderStars = (
    selectedRating: number,
    interactive: boolean = false
  ) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => {
              if (interactive) {
                setRating(star);
              }
            }}
            onMouseEnter={() => {
              if (interactive) {
                setHoverRating(star);
              }
            }}
            onMouseLeave={() => {
              if (interactive) {
                setHoverRating(0);
              }
            }}
            className={
              interactive
                ? "cursor-pointer transition-transform hover:scale-110"
                : "cursor-default"
            }
            aria-label={interactive ? `Rate ${star} stars` : undefined}
          >
            <Star
              size={interactive ? 28 : 18}
              className={
                star <= selectedRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <section className="mt-10 border-t border-gray-200 pt-8">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Customer Reviews
      </h2>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="animate-spin" size={20} />
          Loading reviews...
        </div>
      ) : (
        <>
          {/* Rating Summary */}
          <div className="mb-8 rounded-lg bg-gray-50 p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div>
                <p className="text-4xl font-bold text-gray-900">
                  {reviewsData?.averageRating?.toFixed(1) || "0.0"}
                </p>

                {renderStars(
                  Math.round(reviewsData?.averageRating || 0)
                )}

                <p className="mt-2 text-sm text-gray-600">
                  {reviewsData?.total || 0} reviews
                </p>
              </div>

              <div className="flex-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count =
                    reviewsData?.ratingBreakdown?.[String(star)] || 0;

                  const total = reviewsData?.total || 0;

                  const percentage =
                    total > 0 ? (count / total) * 100 : 0;

                  return (
                    <div
                      key={star}
                      className="mb-2 flex items-center gap-3"
                    >
                      <span className="w-12 text-sm text-gray-600">
                        {star} star
                      </span>

                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-yellow-400"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <span className="w-8 text-right text-sm text-gray-600">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Review Form */}
          <div className="mb-10 rounded-lg border border-gray-200 p-6">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">
              Write a Review
            </h3>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label
                  htmlFor="guestName"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Your Name
                </label>

                <input
                  id="guestName"
                  type="text"
                  value={guestName}
                  onChange={(event) => setGuestName(event.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-black"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Your Rating
                </p>

                {renderStars(hoverRating || rating, true)}
              </div>

              <div>
                <label
                  htmlFor="reviewComment"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Your Review
                </label>

                <textarea
                  id="reviewComment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Write your review..."
                  rows={4}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-black"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              {successMessage && (
                <p className="text-sm text-green-600">
                  {successMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-md bg-black px-5 py-3 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Review
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {reviewsData?.reviews && reviewsData.reviews.length > 0 ? (
              reviewsData.reviews.map((review: Review) => (
                <div
                  key={review.id}
                  className="border-b border-gray-200 pb-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                        <User size={20} className="text-gray-600" />
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {review.guestName}
                        </h4>

                        <p className="text-xs text-gray-500">
                          {new Date(
                            review.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {renderStars(review.rating)}
                  </div>

                  <p className="mt-3 text-gray-700">{review.comment}</p>

                  {/* Admin Replies */}
                  {review.replies && review.replies.length > 0 && (
                    <div className="mt-4 rounded-md bg-gray-50 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <MessageCircle
                          size={18}
                          className="text-gray-600"
                        />

                        <span className="font-semibold text-gray-800">
                          Admin Reply
                        </span>
                      </div>

                      {review.replies.map((reply) => (
                        <div key={reply.id} className="mb-3 last:mb-0">
                          <p className="text-sm text-gray-700">
                            {reply.message}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {reply.admin.name} •{" "}
                            {new Date(
                              reply.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-600">
                No reviews yet. Be the first to review this product.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default ReviewSection;