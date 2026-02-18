import axiosInstance from '../../../../lib/axios';
import { API_ENDPOINTS } from '../../../../config/constants';
import type { Return, ReturnUpdate, ReturnListParams, ReturnStatus } from '../types';

export const returnService = {
  list: async (params?: ReturnListParams): Promise<Return[]> => {
    // Filter out empty string values to prevent 422 errors on backend
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    ) : undefined;
    const response = await axiosInstance.get<Return[]>(API_ENDPOINTS.ADMIN.RETURNS.LIST, { params: cleanParams });
    return response.data;
  },

  get: async (id: string): Promise<Return> => {
    const response = await axiosInstance.get<Return>(`/returns/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, data: ReturnUpdate): Promise<Return> => {
    const response = await axiosInstance.put<Return>(`/returns/${id}/status`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/returns/${id}`);
  },

  getStatuses: async (): Promise<ReturnStatus[]> => {
    const response = await axiosInstance.get<ReturnStatus[]>(API_ENDPOINTS.ADMIN.RETURNS.STATUS);
    return response.data;
  },
};
