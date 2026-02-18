import axiosInstance from '../../../../lib/axios';
import type { UserRating, UserRatingForm } from '../types';

const RATINGS_ENDPOINT = '/user-ratings';

export const ratingService = {
  // Get my rating for a product
  getMyRatingForProduct: async (productId: string): Promise<UserRating | null> => {
    try {
      const response = await axiosInstance.get(`${RATINGS_ENDPOINT}/by-product/${productId}/me`);
      return response.data;
    } catch (error: unknown) {
      // 404 means no rating exists
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          return null;
        }
      }
      throw error;
    }
  },

  // Create a rating
  create: async (data: UserRatingForm): Promise<UserRating> => {
    const response = await axiosInstance.post(RATINGS_ENDPOINT, data);
    return response.data;
  },

  // Update a rating
  update: async (id: string, data: Partial<UserRatingForm>): Promise<UserRating> => {
    const response = await axiosInstance.put(`${RATINGS_ENDPOINT}/${id}`, data);
    return response.data;
  },

  // Delete a rating
  remove: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${RATINGS_ENDPOINT}/${id}`);
  },
};
