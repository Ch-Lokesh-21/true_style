export interface Review {
  _id: string;
  product_id: string;
  user_id: string;
  review_status_id: string;
  image_url?: string;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewUpdate {
  review_status_id?: string;
}

export interface ReviewListParams {
  skip?: number;
  limit?: number;
  product_id?: string;
  user_id?: string;
  review_status_id?: string;
  q?: string;
}

export interface ReviewStatus {
  _id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewFormData {
  review_status_id: string;
}
