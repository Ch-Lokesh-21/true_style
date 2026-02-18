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
  exchange_status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeUpdate {
  exchange_status_id?: string;
  status_id?: string;
}

export interface ExchangeListParams {
  skip?: number;
  limit?: number;
  user_id?: string;
  exchange_status_id?: string;
  order_id?: string;
}

export interface ExchangeStatus {
  _id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
