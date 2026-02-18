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
}

export interface ProductCreateForm {
  brand_id: string;
  occasion_id: string;
  category_id: string;
  product_type_id: string;
  name: string;
  description: string;
  price: number;
  hsn_code: number;
  gst_percentage: number;
  gst_amount: number;
  total_price: number;
  color: string;
  quantity: number;
  thumbnail: File;
}

export interface ProductUpdateForm {
  brand_id?: string;
  occasion_id?: string;
  category_id?: string;
  product_type_id?: string;
  name?: string;
  description?: string;
  price?: number;
  hsn_code?: number;
  gst_percentage?: number;
  gst_amount?: number;
  total_price?: number;
  color?: string;
  quantity?: number;
  thumbnail?: File;
}

export interface ProductFormData {
  brand_id: string;
  occasion_id: string;
  category_id: string;
  product_type_id: string;
  name: string;
  description: string;
  price: number;
  hsn_code: number;
  gst_percentage: number;
  gst_amount: number;
  total_price: number;
  color: string;
  quantity: number;
  thumbnail?: FileList;
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
  out_of_stock?: boolean;
  min_price?: number;
  max_price?: number;
}
