const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export interface ReviewReply {
  id: string;
  message: string;
  createdAt: string;
  admin: {
    name: string;
  };
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  guestName: string;
  createdAt: string;
  replies: ReviewReply[];
}

export interface ReviewResponse {
  success: boolean;
  total: number;
  averageRating: number;
  ratingBreakdown: Record<string, number>;
  reviews: Review[];
}

export async function getProductReviews(
  productId: string
): Promise<ReviewResponse> {
  const response = await fetch(
    `${API_BASE_URL}/reviews/product/${productId}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load reviews");
  }

  return {
    success: data.success,
    reviews: data.data.reviews,
    total: data.data.summary.totalReviews,
    averageRating: data.data.summary.averageRating,
    ratingBreakdown: data.data.summary.ratingBreakdown,
  };
}
export async function createReview(
  productId: string,
  reviewData: {
    rating: number;
    comment: string;
    guestName: string;
  }
) {
  const response = await fetch(
    `${API_BASE_URL}/reviews/product/${productId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
    }
  );

  
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to submit review");
  }

  return data;
}