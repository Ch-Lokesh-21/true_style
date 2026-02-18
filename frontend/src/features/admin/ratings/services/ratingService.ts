import axiosInstance from '../../../../lib/axios';
import { API_ENDPOINTS } from '../../../../config/constants';
import type { Rating, RatingListParams } from '../types';

export const ratingService = {
  list: async (params?: RatingListParams): Promise<Rating[]> => {
    // Filter out empty string values to prevent 422 errors on backend
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    ) : undefined;
    const response = await axiosInstance.get<Rating[]>(API_ENDPOINTS.ADMIN.RATINGS.LIST, { params: cleanParams });
    return response.data;
  },

  get: async (id: string): Promise<Rating> => {
    const response = await axiosInstance.get<Rating>(`/user-ratings/${id}`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.RATINGS.DELETE}/${id}`);
  },
};
