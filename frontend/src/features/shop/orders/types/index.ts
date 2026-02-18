import type { Product } from '../../products/types';
import type { UserAddress } from '../../addresses/types';

// ============ Order Types ============
export interface Order {
  _id: string;
  user_id: string;
  address: UserAddress;
  status_id: string;
  total: number;
  delivery_otp?: number;
  delivery_date: string;
  payment_method: 'cod' | 'razorpay';
  razorpay_payment_id?: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
}

export interface OrderItem {
  _id: string;
  order_id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  size?: string;
  item_status: ItemStatus;
  createdAt: string;
  updatedAt: string;
  order_status?: string;
  // Populated product info
  product?: Product;
}

// Enriched order item with product details for display
export interface OrderItemEnriched extends OrderItem {
  product_name: string;
  thumbnail_url?: string;
  brand_name?: string;
  price: number;
  total_price: number;
  out_of_stock: boolean;
}

export type ItemStatus = 
  | 'ordered'
  | 'return_requested'
  | 'returned'
  | 'return_rejected'
  | 'exchange_requested'
  | 'exchanged'
  | 'exchange_rejected';
