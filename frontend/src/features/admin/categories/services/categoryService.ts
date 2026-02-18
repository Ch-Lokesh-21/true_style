import axiosInstance from '../../../../lib/axios';
import { API_ENDPOINTS } from '../../../../config/constants';
import type { Category, CategoryCreate, CategoryUpdate, CategoryListParams } from '../types';

export const categoryService = {
  list: async (params?: CategoryListParams): Promise<Category[]> => {
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    ) : undefined;
    const response = await axiosInstance.get<Category[]>(API_ENDPOINTS.ADMIN.CATEGORIES, { params: cleanParams });
    return response.data;
  },

  get: async (id: string): Promise<Category> => {
    const response = await axiosInstance.get<Category>(`${API_ENDPOINTS.ADMIN.CATEGORIES}/${id}`);
    return response.data;
  },

  create: async (data: CategoryCreate): Promise<Category> => {
    const response = await axiosInstance.post<Category>(API_ENDPOINTS.ADMIN.CATEGORIES, data);
    return response.data;
  },

  update: async (id: string, data: CategoryUpdate): Promise<Category> => {
    const response = await axiosInstance.put<Category>(`${API_ENDPOINTS.ADMIN.CATEGORIES}/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.CATEGORIES}/${id}`);
  },
};
