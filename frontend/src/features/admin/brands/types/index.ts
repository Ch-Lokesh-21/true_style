export interface Brand {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandCreate {
  name: string;
}

export interface BrandUpdate {
  name?: string;
}

export interface BrandFormData {
  name: string;
}

export interface BrandListParams {
  skip?: number;
  limit?: number;
  name?: string;
  q?: string;
}
