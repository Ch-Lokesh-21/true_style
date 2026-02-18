import axiosInstance from '../../../../lib/axios';
import { API_ENDPOINTS } from '../../../../config/constants';
import type { Review, ReviewListParams, ReviewStatus } from '../types';

export const reviewService = {
  list: async (params?: ReviewListParams): Promise<Review[]> => {
    // Filter out empty string values to prevent 422 errors on backend
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    ) : undefined;
    const response = await axiosInstance.get<Review[]>(API_ENDPOINTS.ADMIN.REVIEWS.LIST, { params: cleanParams });
    return response.data;
  },

  get: async (id: string): Promise<Review> => {
    const response = await axiosInstance.get<Review>(`/user-reviews/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, statusId: string): Promise<Review> => {
    const response = await axiosInstance.put<Review>(`${API_ENDPOINTS.ADMIN.REVIEWS.SET_STATUS}/${id}/set-status/${statusId}`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.REVIEWS.DELETE}/${id}`);
  },

  getStatuses: async (): Promise<ReviewStatus[]> => {
    const response = await axiosInstance.get<ReviewStatus[]>(API_ENDPOINTS.ADMIN.REVIEWS.STATUS);
    return response.data;
  },
};
