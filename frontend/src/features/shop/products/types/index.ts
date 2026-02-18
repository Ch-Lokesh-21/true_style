// ============ Product Types ============
export interface Product {
  _id: string;
  brand_id: string;
  occasion_id: string;
  category_id: string;
  product_type_id: string;
  name: string;
  description: string;
  rating?: number;
  price: number;
  hsn_code: number;
  gst_percentage: number;
  gst_amount: number;
  total_price: number;
  color: string;
  out_of_stock: boolean;
  thumbnail_url: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  brand_name?: string;
  category_name?: string;
  occasion_name?: string;
  product_type_name?: string;
}

export interface ProductListParams {
  skip?: number;
  limit?: number;
  q?: string;
  brand_id?: string;
  category_id?: string;
  occasion_id?: string;
  product_type_id?: string;
  color?: string;
  min_price?: number;
  max_price?: number;
}

// ============ Product Images ============
export interface ProductImage {
  _id: string;
  product_id: string;
  image_url: string;
  idx: number;
  createdAt: string;
  updatedAt: string;
}
