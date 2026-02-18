// ============ Rating Types ============
export interface UserRating {
  _id: string;
  product_id: string;
  user_id: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserRatingForm {
  product_id: string;
  user_id: string;
  rating: number;
}

// ============ Review Types ============
export interface UserReview {
  _id: string;
  product_id: string;
  user_id: string;
  review_status_id: string;
  image_url?: string;
  review?: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  user_name?: string;
}

export interface UserReviewForm {
  product_id: string;
  user_id: string;
  review_status_id: string;
  review?: string;
  image?: File;
}
