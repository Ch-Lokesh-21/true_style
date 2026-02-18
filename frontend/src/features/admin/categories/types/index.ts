export interface Category {
  _id: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryCreate {
  category: string;
}

export interface CategoryUpdate {
  category?: string;
}

export interface CategoryFormData {
  category: string;
}

export interface CategoryListParams {
  skip?: number;
  limit?: number;
  category?: string;
  q?: string;
}
