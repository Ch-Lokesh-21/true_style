import axiosInstance from '../../../../lib/axios';
import type { Return, ReturnOptions, ReturnCreateForm } from '../types';

const RETURNS_ENDPOINT = '/returns';

export const returnService = {
  // Get return options for an order item
  getOptions: async (orderItemId: string): Promise<ReturnOptions> => {
    const response = await axiosInstance.get(`${RETURNS_ENDPOINT}/options/${orderItemId}`);
    return response.data;
  },

  // Create a return request
  create: async (data: ReturnCreateForm): Promise<Return> => {
    const formData = new FormData();
    formData.append('order_item_id', data.order_item_id);
    formData.append('quantity', String(data.quantity));
    if (data.reason) formData.append('reason', data.reason);
    if (data.image) formData.append('image', data.image);

    const response = await axiosInstance.post(RETURNS_ENDPOINT, formData);
    return response.data;
  },

  // List user's returns
  listMyReturns: async (params?: { skip?: number; limit?: number }): Promise<Return[]> => {
    const response = await axiosInstance.get(`${RETURNS_ENDPOINT}/my`, { params });
    return response.data;
  },

  // Get single return
  getMyReturn: async (id: string): Promise<Return> => {
    const response = await axiosInstance.get(`${RETURNS_ENDPOINT}/my/${id}`);
    return response.data;
  },
};
