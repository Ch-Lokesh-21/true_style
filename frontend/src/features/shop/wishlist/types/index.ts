import type { Product } from '../../products/types';

// ============ Wishlist Types ============
export interface Wishlist {
  _id: string;
  user_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  _id: string;
  wishlist_id: string;
  product_id: string;
  createdAt: string;
  updatedAt: string;
  // Populated product info
  product?: Product;
}

// Enriched wishlist item with product details for display
export interface WishlistItemEnriched extends WishlistItem {
  product_name: string;
  thumbnail_url?: string;
  brand_name?: string;
  price: number;
  total_price: number;
  out_of_stock: boolean;
}
