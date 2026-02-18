export interface ProductImage {
  _id: string;
  product_id: string;
  image_url: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImageCreate {
  product_id: string;
  image: File;
}

export interface ProductImageUpdate {
  product_id?: string;
  image?: File;
}

export interface ProductImageListParams {
  skip?: number;
  limit?: number;
  product_id?: string;
}
