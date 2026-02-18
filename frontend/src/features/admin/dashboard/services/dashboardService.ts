import axiosInstance from '../../../../lib/axios';
import { API_ENDPOINTS } from '../../../../config/constants';
import type {
  OverviewOut,
  AdminOverviewOut,
  SalesByCategoryOut,
  SalesByBrandOut,
  PendingWorkSummaryOut,
  RecentOrdersOut,
  SalesSeriesOut,
  UserGrowthOut,
  TopProductsOut,
  LowStockOut,
  SystemHealthOut,
  DashboardSalesParams,
  DashboardUserGrowthParams,
  DashboardTopProductsParams,
  DashboardLowStockParams,
  DashboardPendingWorkParams,
  DashboardRecentOrdersParams,
} from '../types';

const cleanParams = (params?: Record<string, unknown>) =>
  params
    ? Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== null && value !== undefined),
      )
    : undefined;

export const dashboardService = {
  getOverview: async (): Promise<OverviewOut> => {
    const response = await axiosInstance.get<OverviewOut>(API_ENDPOINTS.ADMIN.DASHBOARD.OVERVIEW);
    return response.data;
  },

  getAdminOverview: async (): Promise<AdminOverviewOut> => {
    const response = await axiosInstance.get<AdminOverviewOut>(API_ENDPOINTS.ADMIN.DASHBOARD.ADMIN_OVERVIEW);
    return response.data;
  },

  getSalesByCategory: async (): Promise<SalesByCategoryOut> => {
    const response = await axiosInstance.get<SalesByCategoryOut>(API_ENDPOINTS.ADMIN.DASHBOARD.SALES_BY_CATEGORY);
    return response.data;
  },

  getSalesByBrand: async (): Promise<SalesByBrandOut> => {
    const response = await axiosInstance.get<SalesByBrandOut>(API_ENDPOINTS.ADMIN.DASHBOARD.SALES_BY_BRAND);
    return response.data;
  },

  getPendingWork: async (params?: DashboardPendingWorkParams): Promise<PendingWorkSummaryOut> => {
    const response = await axiosInstance.get<PendingWorkSummaryOut>(
      API_ENDPOINTS.ADMIN.DASHBOARD.PENDING_WORK,
      { params: cleanParams(params as unknown as Record<string, unknown>) },
    );
    return response.data;
  },

  getRecentOrders: async (params?: DashboardRecentOrdersParams): Promise<RecentOrdersOut> => {
    const response = await axiosInstance.get<RecentOrdersOut>(
      API_ENDPOINTS.ADMIN.DASHBOARD.RECENT_ORDERS,
      { params: cleanParams(params as unknown as Record<string, unknown>) },
    );
    return response.data;
  },

  getSales: async (params?: DashboardSalesParams): Promise<SalesSeriesOut> => {
    const response = await axiosInstance.get<SalesSeriesOut>(
      API_ENDPOINTS.ADMIN.DASHBOARD.SALES,
      { params: cleanParams(params as unknown as Record<string, unknown>) },
    );
    return response.data;
  },

  getUserGrowth: async (params?: DashboardUserGrowthParams): Promise<UserGrowthOut> => {
    const response = await axiosInstance.get<UserGrowthOut>(
      API_ENDPOINTS.ADMIN.DASHBOARD.USER_GROWTH,
      { params: cleanParams(params as unknown as Record<string, unknown>) },
    );
    return response.data;
  },

  getTopProducts: async (params?: DashboardTopProductsParams): Promise<TopProductsOut> => {
    const response = await axiosInstance.get<TopProductsOut>(
      API_ENDPOINTS.ADMIN.DASHBOARD.TOP_PRODUCTS,
      { params: cleanParams(params as unknown as Record<string, unknown>) },
    );
    return response.data;
  },

  getLowStock: async (params?: DashboardLowStockParams): Promise<LowStockOut> => {
    const response = await axiosInstance.get<LowStockOut>(
      API_ENDPOINTS.ADMIN.DASHBOARD.LOW_STOCK,
      { params: cleanParams(params as unknown as Record<string, unknown>) },
    );
    return response.data;
  },

  getSystemHealth: async (): Promise<SystemHealthOut> => {
    const response = await axiosInstance.get<SystemHealthOut>(API_ENDPOINTS.ADMIN.DASHBOARD.SYSTEM_HEALTH);
    return response.data;
  },
};
