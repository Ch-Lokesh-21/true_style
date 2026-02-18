export interface Occasion {
  _id: string;
  occasion: string;
  createdAt: string;
  updatedAt: string;
}

export interface OccasionCreate {
  occasion: string;
}

export interface OccasionUpdate {
  occasion?: string;
}

export interface OccasionFormData {
  occasion: string;
}

export interface OccasionListParams {
  skip?: number;
  limit?: number;
  occasion?: string;
  q?: string;
}
