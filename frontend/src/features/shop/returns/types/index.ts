import type { Product } from '../../products/types';

// ============ Return Types ============
export interface Return {
  _id: string;
  order_id: string;
  order_item_id: string;
  product_id: string;
  return_status_id: string;
  user_id: string;
  reason?: string;
  image_url?: string;
  quantity: number;
  amount?: number;
  createdAt: string;
  updatedAt: string;
  return_status?: string;
  // Populated product info
  product?: Product;
}

// Enriched return with product and order item details
export interface ReturnEnriched extends Return {
  product_name: string;
  thumbnail_url?: string;
  brand_name?: string;
  price: number;
  size?: string;
}

export interface ReturnOptions {
  can_return: boolean;
  days_remaining: number;
  product: Product;
  ordered_quantity: number;
  already_returned: number;
  returnable_quantity: number;
  refund_per_item: number;
  max_refund: number;
}

export interface ReturnCreateForm {
  order_item_id: string;
  quantity: number;
  reason?: string;
  image?: File;
}
