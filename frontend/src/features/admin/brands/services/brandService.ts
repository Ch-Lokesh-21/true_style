import axiosInstance from '../../../../lib/axios';
import { API_ENDPOINTS } from '../../../../config/constants';
import type { Brand, BrandCreate, BrandUpdate, BrandListParams } from '../types';

export const brandService = {
  list: async (params?: BrandListParams): Promise<Brand[]> => {
    // Filter out empty string values to prevent 422 errors on backend
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    ) : undefined;
    const response = await axiosInstance.get<Brand[]>(API_ENDPOINTS.ADMIN.BRANDS, { params: cleanParams });
    return response.data;
  },

  get: async (id: string): Promise<Brand> => {
    const response = await axiosInstance.get<Brand>(`${API_ENDPOINTS.ADMIN.BRANDS}/${id}`);
    return response.data;
  },

  create: async (data: BrandCreate): Promise<Brand> => {
    const response = await axiosInstance.post<Brand>(API_ENDPOINTS.ADMIN.BRANDS, data);
    return response.data;
  },

  update: async (id: string, data: BrandUpdate): Promise<Brand> => {
    const response = await axiosInstance.put<Brand>(`${API_ENDPOINTS.ADMIN.BRANDS}/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.BRANDS}/${id}`);
  },
};
