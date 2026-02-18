import axiosInstance from '../../../../lib/axios';
import { API_ENDPOINTS } from '../../../../config/constants';
import type { ContactUs, ContactUsCreate, ContactUsUpdate } from '../types';

export const contactUsService = {
  getAll: async (params?: { limit?: number; offset?: number }): Promise<ContactUs[]> => {
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== null && value !== undefined)
    ) : undefined;
    const response = await axiosInstance.get<ContactUs[]>(API_ENDPOINTS.ADMIN.CONTACT_US, { params: cleanParams });
    return response.data;
  },

  getById: async (id: string): Promise<ContactUs> => {
    const response = await axiosInstance.get<ContactUs>(`${API_ENDPOINTS.ADMIN.CONTACT_US}/${id}`);
    return response.data;
  },

  create: async (data: ContactUsCreate): Promise<ContactUs> => {
    const response = await axiosInstance.post<ContactUs>(API_ENDPOINTS.ADMIN.CONTACT_US, data);
    return response.data;
  },

  update: async (id: string, data: ContactUsUpdate): Promise<ContactUs> => {
    const response = await axiosInstance.put<ContactUs>(`${API_ENDPOINTS.ADMIN.CONTACT_US}/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.CONTACT_US}/${id}`);
  },
};