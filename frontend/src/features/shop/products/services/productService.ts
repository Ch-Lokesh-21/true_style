import axiosInstance from '../../../../lib/axios';
import { API_ENDPOINTS } from '../../../../config/constants';
import type { Product, ProductListParams, ProductImage } from '../types';

export const productService = {
  // Public product listing (no auth required)
  list: async (params?: ProductListParams): Promise<Product[]> => {
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    ) : undefined;
    const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.PRODUCTS, { params: cleanParams });
    return response.data;
  },

  // Get single product (no auth required)
  get: async (id: string): Promise<Product> => {
    const response = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.PRODUCTS}/${id}`);
    return response.data;
  },

  // Get product images
  getImages: async (productId: string): Promise<ProductImage[]> => {
    const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.PRODUCT_IMAGES, {
      params: { product_id: productId }
    });
    return response.data;
  },
};
