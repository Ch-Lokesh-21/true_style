import axiosInstance from '../../../../lib/axios';
import { API_ENDPOINTS } from '../../../../config/constants';
import type { ProductImage, ProductImageCreate, ProductImageUpdate, ProductImageListParams } from '../types';

export const productImageService = {
  list: async (params?: ProductImageListParams): Promise<ProductImage[]> => {
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
        )
      : undefined;
    const response = await axiosInstance.get<ProductImage[]>(API_ENDPOINTS.ADMIN.PRODUCT_IMAGES, { params: cleanParams });
    return response.data;
  },

  get: async (id: string): Promise<ProductImage> => {
    const response = await axiosInstance.get<ProductImage>(`${API_ENDPOINTS.ADMIN.PRODUCT_IMAGES}/${id}`);
    return response.data;
  },

  create: async (data: ProductImageCreate): Promise<ProductImage> => {
    const formData = new FormData();
    formData.append('product_id', data.product_id);
    formData.append('image', data.image);

    const response = await axiosInstance.post<ProductImage>(API_ENDPOINTS.ADMIN.PRODUCT_IMAGES, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id: string, data: ProductImageUpdate): Promise<ProductImage> => {
    const formData = new FormData();
    if (data.product_id) formData.append('product_id', data.product_id);
    if (data.image) formData.append('image', data.image);

    const response = await axiosInstance.put<ProductImage>(`${API_ENDPOINTS.ADMIN.PRODUCT_IMAGES}/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.PRODUCT_IMAGES}/${id}`);
  },
};
