import axiosInstance from '../../../../lib/axios';
import type { WishlistItem } from '../types';

const WISHLIST_ITEMS_ENDPOINT = '/wishlist-items';

export const wishlistService = {
  // List wishlist items for current user
  list: async (params?: { skip?: number; limit?: number }): Promise<WishlistItem[]> => {
    const response = await axiosInstance.get(WISHLIST_ITEMS_ENDPOINT, { params });
    return response.data;
  },

  // Get single wishlist item
  get: async (id: string): Promise<WishlistItem> => {
    const response = await axiosInstance.get(`${WISHLIST_ITEMS_ENDPOINT}/${id}`);
    return response.data;
  },

  // Add item to wishlist
  add: async (productId: string): Promise<WishlistItem> => {
    const response = await axiosInstance.post(WISHLIST_ITEMS_ENDPOINT, null, {
      params: { product_id: productId }
    });
    return response.data;
  },

  // Remove item from wishlist
  remove: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${WISHLIST_ITEMS_ENDPOINT}/${id}`);
  },

  // Move wishlist item to cart
  moveToCart: async (id: string, size?: string): Promise<void> => {
    await axiosInstance.post(`${WISHLIST_ITEMS_ENDPOINT}/move-to-cart/${id}`, null, {
      params: size ? { size } : undefined
    });
  },
};
