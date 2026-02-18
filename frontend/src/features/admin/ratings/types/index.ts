export interface Rating {
  _id: string;
  product_id: string;
  user_id: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface RatingListParams {
  skip?: number;
  limit?: number;
  product_id?: string;
  user_id?: string;
  q?: string;
}

export interface RatingFormData {
  rating: number;
}
