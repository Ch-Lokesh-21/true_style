import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import type {
  DashboardSalesParams,
  DashboardUserGrowthParams,
  DashboardTopProductsParams,
  DashboardLowStockParams,
  DashboardPendingWorkParams,
  DashboardRecentOrdersParams,
} from '../types';

const QUERY_KEY = 'dashboard';

export const useOverview = () => {
  return useQuery({
    queryKey: [QUERY_KEY, 'overview'],
    queryFn: () => dashboardService.getOverview(),
  });
};

export const useAdminOverview = () => {
  return useQuery({
    queryKey: [QUERY_KEY, 'admin-overview'],
    queryFn: () => dashboardService.getAdminOverview(),
  });
};

export const useSalesByCategory = () => {
  return useQuery({
    queryKey: [QUERY_KEY, 'sales-by-category'],
    queryFn: () => dashboardService.getSalesByCategory(),
  });
};

export const useSalesByBrand = () => {
  return useQuery({
    queryKey: [QUERY_KEY, 'sales-by-brand'],
    queryFn: () => dashboardService.getSalesByBrand(),
  });
};

export const usePendingWork = (params?: DashboardPendingWorkParams) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'pending-work', params],
    queryFn: () => dashboardService.getPendingWork(params),
  });
};

export const useRecentOrders = (params?: DashboardRecentOrdersParams) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'recent-orders', params],
    queryFn: () => dashboardService.getRecentOrders(params),
  });
};

export const useSalesSeries = (params?: DashboardSalesParams) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'sales', params],
    queryFn: () => dashboardService.getSales(params),
  });
};

export const useUserGrowth = (params?: DashboardUserGrowthParams) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'user-growth', params],
    queryFn: () => dashboardService.getUserGrowth(params),
  });
};

export const useTopProducts = (params?: DashboardTopProductsParams) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'top-products', params],
    queryFn: () => dashboardService.getTopProducts(params),
  });
};

export const useLowStock = (params?: DashboardLowStockParams) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'low-stock', params],
    queryFn: () => dashboardService.getLowStock(params),
  });
};

export const useSystemHealth = () => {
  return useQuery({
    queryKey: [QUERY_KEY, 'system-health'],
    queryFn: () => dashboardService.getSystemHealth(),
  });
};
