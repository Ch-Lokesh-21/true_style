import type { UserAddress } from '../../addresses/types';

// ============ Razorpay Types ============
export interface RazorpayOrderResponse {
  razorpay_order_id: string;
  amount: number;
  amount_in_paise: number;
  currency: string;
  key_id: string;
  address: UserAddress;
  cart_summary: Array<{
    product_id: string;
    name: string;
    quantity: number;
    size: string;
    price: number;
    subtotal: number;
  }>;
  total_items: number;
}

export interface RazorpayPaymentData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
