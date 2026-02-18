import type { Product } from '../../products/types';

// ============ Exchange Types ============
export interface Exchange {
  _id: string;
  order_id: string;
  order_item_id: string;
  product_id: string;
  exchange_status_id: string;
  user_id: string;
  reason?: string;
  image_url?: string;
  new_quantity?: number;
  new_size?: string;
  original_size?: string;
  createdAt: string;
  updatedAt: string;
  exchange_status?: string;
  // Populated product info
  product?: Product;
}

// Enriched exchange with product and order item details
export interface ExchangeEnriched extends Exchange {
  product_name: string;
  thumbnail_url?: string;
  brand_name?: string;
  price: number;
}

export interface ExchangeOptions {
  can_exchange: boolean;
  days_remaining: number;
  product: Product;
  available_sizes: { size: string; available: boolean }[];
  current_size?: string;
  current_quantity: number;
}

export interface ExchangeCreateForm {
  order_item_id: string;
  new_quantity: number;
  new_size?: string;
  reason?: string;
  image?: File;
}
