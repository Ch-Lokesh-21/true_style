import axiosInstance from '../../../../lib/axios';
import type { CartItem, CartAvailabilityResponse } from '../types';

const CART_ITEMS_ENDPOINT = '/cart-items';

export const cartService = {
  // List cart items for current user
  list: async (params?: { skip?: number; limit?: number }): Promise<CartItem[]> => {
    const response = await axiosInstance.get(CART_ITEMS_ENDPOINT, { params });
    return response.data;
  },

  // Get single cart item
  get: async (id: string): Promise<CartItem> => {
    const response = await axiosInstance.get(`${CART_ITEMS_ENDPOINT}/${id}`);
    return response.data;
  },

  // Add item to cart (creates or increments)
  add: async (productId: string, size: string, quantity: number = 1): Promise<CartItem> => {
    const response = await axiosInstance.post(CART_ITEMS_ENDPOINT, null, {
      params: { product_id: productId, size, quantity }
    });
    return response.data;
  },

  // Update cart item (quantity/size)
  update: async (id: string, data: { quantity?: number; size?: string }): Promise<CartItem> => {
    const response = await axiosInstance.put(`${CART_ITEMS_ENDPOINT}/${id}`, data);
    return response.data;
  },

  // Remove item from cart
  remove: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${CART_ITEMS_ENDPOINT}/${id}`);
  },

  // Move cart item to wishlist
  moveToWishlist: async (id: string): Promise<void> => {
    await axiosInstance.post(`${CART_ITEMS_ENDPOINT}/move-to-wishlist/${id}`);
  },

  // Check cart availability - returns enriched items with product details
  checkAvailability: async (): Promise<CartAvailabilityResponse> => {
    const response = await axiosInstance.get(`${CART_ITEMS_ENDPOINT}/check-availability`);
    return response.data;
  },
};
