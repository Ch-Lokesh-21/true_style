import axiosInstance from '../../../../lib/axios';
import type { UserAddress, UserAddressForm } from '../types';

const USER_ADDRESS_ENDPOINT = '/user-address';

export const addressService = {
  // List user's addresses
  list: async (params?: { skip?: number; limit?: number }): Promise<UserAddress[]> => {
    const response = await axiosInstance.get(USER_ADDRESS_ENDPOINT, { params });
    return response.data;
  },

  // Get single address
  get: async (id: string): Promise<UserAddress> => {
    const response = await axiosInstance.get(`${USER_ADDRESS_ENDPOINT}/${id}`);
    return response.data;
  },

  // Create new address
  create: async (data: UserAddressForm): Promise<UserAddress> => {
    const response = await axiosInstance.post(USER_ADDRESS_ENDPOINT, data);
    return response.data;
  },

  // Update address
  update: async (id: string, data: Partial<UserAddressForm>): Promise<UserAddress> => {
    const response = await axiosInstance.put(`${USER_ADDRESS_ENDPOINT}/${id}`, data);
    return response.data;
  },

  // Delete address
  remove: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${USER_ADDRESS_ENDPOINT}/${id}`);
  },
};
