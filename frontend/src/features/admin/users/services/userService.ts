import axiosInstance from '../../../../lib/axios';
import { API_ENDPOINTS } from '../../../../config/constants';
import type { User, UserListParams } from '../types';

export const userService = {
  list: async (params?: UserListParams): Promise<User[]> => {
    // Filter out empty string values to prevent 422 errors on backend
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    ) : undefined;
    const response = await axiosInstance.get<User[]>(API_ENDPOINTS.USERS.LIST, { params: cleanParams });
    return response.data;
  },

  get: async (id: string): Promise<User> => {
    const response = await axiosInstance.get<User>(`${API_ENDPOINTS.USERS.LIST}/${id}`);
    return response.data;
  },
};