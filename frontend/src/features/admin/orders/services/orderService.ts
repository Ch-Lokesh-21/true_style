import axiosInstance from '../../../../lib/axios';
import { API_ENDPOINTS } from '../../../../config/constants';
import type { Order, OrderUpdate, OrderListParams, OrderStatus } from '../types';

export const orderService = {
  list: async (params?: OrderListParams): Promise<Order[]> => {
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    ) : undefined;
    const response = await axiosInstance.get<Order[]>(API_ENDPOINTS.ADMIN.ORDERS.LIST, { params: cleanParams });
    return response.data;
  },

  get: async (id: string): Promise<Order> => {
    const response = await axiosInstance.get<Order>(`/orders/${id}`);
    return response.data;
  },

  update: async (id: string, data: OrderUpdate): Promise<Order> => {
    const response = await axiosInstance.put<Order>(`/orders/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/orders/${id}`);
  },

  getStatuses: async (): Promise<OrderStatus[]> => {
    const response = await axiosInstance.get<OrderStatus[]>(API_ENDPOINTS.ADMIN.ORDERS.STATUS);
    return response.data;
  },
};
