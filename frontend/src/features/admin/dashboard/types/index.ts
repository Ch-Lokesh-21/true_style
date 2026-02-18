export interface TimePoint {
  date: string;
  value: number;
}

export interface OverviewOut {
  users: number;
  products: number;
  orders: number;
  returns: number;
  exchanges: number;
  revenue: number;
}

export interface AdminOverviewOut {
  total_earnings: number;
  pending_orders: number;
  pending_returns: number;
  pending_exchanges: number;
  total_categories: number;
  total_brands: number;
  total_products: number;
  total_orders: number;
  total_users: number;
  completed_orders: number;
  out_of_stock_products: number;
}

export interface CategorySalesItem {
  category_id: string;
  category_name: string;
  total_orders: number;
  total_quantity: number;
  total_revenue: number;
}

export interface SalesByCategoryOut {
  categories: CategorySalesItem[];
  total_categories: number;
}

export interface BrandSalesItem {
  brand_id: string;
  brand_name: string;
  total_orders: number;
  total_quantity: number;
  total_revenue: number;
}

export interface SalesByBrandOut {
  brands: BrandSalesItem[];
  total_brands: number;
}

export interface PendingOrderItem {
  order_id: string;
  user_id: string;
  total: number;
  status: string | null;
  delivery_date: string | null;
  created_at: string | null;
}

export interface PendingReturnItem {
  return_id: string;
  order_id: string;
  user_id: string;
  product_id: string;
  reason: string | null;
  return_status: string | null;
  created_at: string | null;
}

export interface PendingExchangeItem {
  exchange_id: string;
  order_id: string;
  user_id: string;
  product_id: string;
  reason: string | null;
  exchange_status: string | null;
  created_at: string | null;
}

export interface PendingWorkSummaryOut {
  pending_orders: PendingOrderItem[];
  pending_returns: PendingReturnItem[];
  pending_exchanges: PendingExchangeItem[];
  pending_orders_count: number;
  pending_returns_count: number;
  pending_exchanges_count: number;
}

export interface RecentOrderItem {
  order_id: string;
  user_id: string;
  total: number;
  status: string | null;
  payment_method: string | null;
  delivery_date: string | null;
  created_at: string | null;
}

export interface RecentOrdersOut {
  orders: RecentOrderItem[];
  total_count: number;
}

export interface SalesSeriesOut {
  days: number;
  series: TimePoint[];
}

export interface UserGrowthOut {
  days: number;
  series: TimePoint[];
}

export interface TopProductOut {
  product_id: string;
  name: string;
  total_quantity: number;
  total_orders: number;
  total_revenue: number;
}

export interface TopProductsOut {
  limit: number;
  items: TopProductOut[];
}

export interface LowStockItemOut {
  product_id: string;
  name: string;
  quantity: number;
}

export interface LowStockOut {
  threshold: number;
  items: LowStockItemOut[];
}

export interface LastBackupInfo {
  status: string;
  scope: string | null;
  frequency: string | null;
  size: number | null;
  scheduled_at: string | null;
  started_at: string | null;
  finished_at: string | null;
  path: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface SystemHealthOut {
  last_backup: LastBackupInfo | null;
  failed_backups_7d: number;
  failed_restores_7d: number;
}

export interface DashboardSalesParams {
  days?: number;
}

export interface DashboardUserGrowthParams {
  days?: number;
}

export interface DashboardTopProductsParams {
  limit?: number;
}

export interface DashboardLowStockParams {
  threshold?: number;
}

export interface DashboardPendingWorkParams {
  limit?: number;
}

export interface DashboardRecentOrdersParams {
  limit?: number;
}
