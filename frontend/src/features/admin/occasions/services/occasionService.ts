import axiosInstance from '../../../../lib/axios';
import { API_ENDPOINTS } from '../../../../config/constants';
import type { Occasion, OccasionCreate, OccasionUpdate, OccasionListParams } from '../types';

export const occasionService = {
  list: async (params?: OccasionListParams): Promise<Occasion[]> => {
    // Filter out empty string values to prevent 422 errors on backend
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    ) : undefined;
    const response = await axiosInstance.get<Occasion[]>(API_ENDPOINTS.ADMIN.OCCASIONS, { params: cleanParams });
    return response.data;
  },

  get: async (id: string): Promise<Occasion> => {
    const response = await axiosInstance.get<Occasion>(`${API_ENDPOINTS.ADMIN.OCCASIONS}/${id}`);
    return response.data;
  },

  create: async (data: OccasionCreate): Promise<Occasion> => {
    const response = await axiosInstance.post<Occasion>(API_ENDPOINTS.ADMIN.OCCASIONS, data);
    return response.data;
  },

  update: async (id: string, data: OccasionUpdate): Promise<Occasion> => {
    const response = await axiosInstance.put<Occasion>(`${API_ENDPOINTS.ADMIN.OCCASIONS}/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.OCCASIONS}/${id}`);
  },
};
