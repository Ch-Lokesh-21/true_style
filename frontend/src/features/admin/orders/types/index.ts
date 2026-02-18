export interface Address {
  _id: string;
  user_id: string;
  mobile_no: string;
  postal_code: number;
  country: string;
  state: string;
  city: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  user_id: string;
  address: Address;
  status_id: string;
  total: number;
  delivery_otp?: number;
  delivery_date: string;
  payment_method: 'cod' | 'razorpay';
  razorpay_payment_id?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderUpdate {
  delivery_date?: string;
  status_id?: string;
  order_status_id?: string;
}

export interface OrderListParams {
  skip?: number;
  limit?: number;
  user_id?: string;
  status_id?: string;
  payment_method?: 'cod' | 'razorpay';
  start_date?: string;
  end_date?: string;
}

export interface OrderStatus {
  _id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
