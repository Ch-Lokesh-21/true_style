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
  return_status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnUpdate {
  return_status_id?: string;
}

export interface ReturnListParams {
  skip?: number;
  limit?: number;
  user_id?: string;
  return_status_id?: string;
  order_id?: string;
}

export interface ReturnStatus {
  _id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
