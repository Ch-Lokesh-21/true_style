import type { Product } from '../../products/types';

// ============ Cart Types ============
export interface Cart {
  _id: string;
  user_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  _id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  size: string;
  createdAt: string;
  updatedAt: string;
  // Populated product info
  product?: Product;
}

// Enriched cart item from check-availability endpoint
export interface CartItemAvailability {
  cart_item_id: string;
  product_id: string;
  product_name: string;
  size: string;
  requested_quantity: number;
  available_quantity: number;
  available: boolean;
  out_of_stock: boolean;
  price: number;
  subtotal: number;
  thumbnail_url?: string;
  message?: string;
}

export interface CartAvailabilityResponse {
  all_available: boolean;
  total_items: number;
  total_quantity: number;
  total_amount: number;
  items: CartItemAvailability[];
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  totalGst: number;
  grandTotal: number;
}
