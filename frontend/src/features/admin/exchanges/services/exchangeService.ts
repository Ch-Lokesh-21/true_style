import axiosInstance from '../../../../lib/axios';
import { API_ENDPOINTS } from '../../../../config/constants';
import type { Exchange, ExchangeUpdate, ExchangeListParams, ExchangeStatus } from '../types';

export const exchangeService = {
  list: async (params?: ExchangeListParams): Promise<Exchange[]> => {
    // Filter out empty string values to prevent 422 errors on backend
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    ) : undefined;
    const response = await axiosInstance.get<Exchange[]>(API_ENDPOINTS.ADMIN.EXCHANGES.LIST, { params: cleanParams });
    return response.data;
  },

  get: async (id: string): Promise<Exchange> => {
    const response = await axiosInstance.get<Exchange>(`/exchanges/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, data: ExchangeUpdate): Promise<Exchange> => {
    const response = await axiosInstance.put<Exchange>(`/exchanges/${id}/status`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/exchanges/${id}`);
  },

  getStatuses: async (): Promise<ExchangeStatus[]> => {
    const response = await axiosInstance.get<ExchangeStatus[]>(API_ENDPOINTS.ADMIN.EXCHANGES.STATUS);
    return response.data;
  },
};
