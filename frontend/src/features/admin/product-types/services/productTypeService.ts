import axiosInstance from '../../../../lib/axios';
import { API_ENDPOINTS } from '../../../../config/constants';
import type { ProductType, ProductTypeCreate, ProductTypeUpdate, ProductTypeListParams } from '../types';

export const productTypeService = {
  list: async (params?: ProductTypeListParams): Promise<ProductType[]> => {
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(([, value]) => value !== null && value !== undefined),
        )
      : undefined;
    const response = await axiosInstance.get<ProductType[]>(API_ENDPOINTS.ADMIN.PRODUCT_TYPES, { params: cleanParams });
    return response.data;
  },

  get: async (id: string): Promise<ProductType> => {
    const response = await axiosInstance.get<ProductType>(`${API_ENDPOINTS.ADMIN.PRODUCT_TYPES}/${id}`);
    return response.data;
  },

  create: async (data: ProductTypeCreate): Promise<ProductType> => {
    const formData = new FormData();
    formData.append('type', data.type);
    formData.append('size_chart', data.size_chart);
    formData.append('thumbnail', data.thumbnail);

    const response = await axiosInstance.post<ProductType>(API_ENDPOINTS.ADMIN.PRODUCT_TYPES, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id: string, data: ProductTypeUpdate): Promise<ProductType> => {
    const formData = new FormData();
    if (data.type !== undefined) {
      formData.append('type', data.type);
    }
    if (data.size_chart) {
      formData.append('size_chart', data.size_chart);
    }
    if (data.thumbnail) {
      formData.append('thumbnail', data.thumbnail);
    }

    const response = await axiosInstance.put<ProductType>(`${API_ENDPOINTS.ADMIN.PRODUCT_TYPES}/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.PRODUCT_TYPES}/${id}`);
  },
};
