import axiosInstance from '../../../../lib/axios';
import type { UserReview, UserReviewForm } from '../types';

const REVIEWS_ENDPOINT = '/user-reviews';

export const reviewService = {
  // List reviews for a product (public)
  listForProduct: async (productId: string, params?: { skip?: number; limit?: number }): Promise<UserReview[]> => {
    const response = await axiosInstance.get(REVIEWS_ENDPOINT, {
      params: { product_id: productId, ...params }
    });
    return response.data;
  },

  // Get my review for a product
  getMyReviewForProduct: async (productId: string): Promise<UserReview | null> => {
    try {
      const response = await axiosInstance.get(`${REVIEWS_ENDPOINT}/by-product/${productId}/me`);
      return response.data;
    } catch (error: unknown) {
      // 404 means no review exists
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          return null;
        }
      }
      throw error;
    }
  },

  // Create a review
  create: async (data: UserReviewForm): Promise<UserReview> => {
    const formData = new FormData();
    formData.append('product_id', data.product_id);
    formData.append('review_status_id', data.review_status_id);
    if (data.review) formData.append('review', data.review);
    if (data.image) formData.append('image', data.image);

    const response = await axiosInstance.post(REVIEWS_ENDPOINT, formData);
    return response.data;
  },

  // Update a review
  update: async (id: string, data: Partial<UserReviewForm>): Promise<UserReview> => {
    const formData = new FormData();
    if (data.product_id) formData.append('product_id', data.product_id);
    if (data.review_status_id) formData.append('review_status_id', data.review_status_id);
    if (data.review) formData.append('review', data.review);
    if (data.image) formData.append('image', data.image);

    const response = await axiosInstance.put(`${REVIEWS_ENDPOINT}/${id}`, formData);
    return response.data;
  },

  // Delete a review
  remove: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${REVIEWS_ENDPOINT}/${id}`);
  },
};
