// ============ Product Type (Category) ============
export interface ProductType {
  _id: string;
  type: string;
  size_chart_url: string;
  thumbnail_url: string;
  createdAt: string;
  updatedAt: string;
}

// ============ Category ============
export interface Category {
  _id: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

// ============ Occasion ============
export interface Occasion {
  _id: string;
  occasion: string;
  createdAt: string;
  updatedAt: string;
}

// ============ Brand ============
export interface Brand {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// ============ Order Status Types ============
export interface OrderStatus {
  _id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnStatus {
  _id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeStatus {
  _id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStatus {
  _id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
