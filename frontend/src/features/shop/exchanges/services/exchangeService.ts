import axiosInstance from '../../../../lib/axios';
import type { Exchange, ExchangeOptions, ExchangeCreateForm } from '../types';

const EXCHANGES_ENDPOINT = '/exchanges';

export const exchangeService = {
  // Get exchange options for an order item
  getOptions: async (orderItemId: string): Promise<ExchangeOptions> => {
    const response = await axiosInstance.get(`${EXCHANGES_ENDPOINT}/options/${orderItemId}`);
    return response.data;
  },

  // Create an exchange request
  create: async (data: ExchangeCreateForm): Promise<Exchange> => {
    const formData = new FormData();
    formData.append('order_item_id', data.order_item_id);
    formData.append('new_quantity', String(data.new_quantity));
    if (data.new_size) formData.append('new_size', data.new_size);
    if (data.reason) formData.append('reason', data.reason);
    if (data.image) formData.append('image', data.image);

    const response = await axiosInstance.post(EXCHANGES_ENDPOINT, formData);
    return response.data;
  },

  // List user's exchanges
  listMyExchanges: async (params?: { skip?: number; limit?: number }): Promise<Exchange[]> => {
    const response = await axiosInstance.get(`${EXCHANGES_ENDPOINT}/my`, { params });
    return response.data;
  },

  // Get single exchange
  getMyExchange: async (id: string): Promise<Exchange> => {
    const response = await axiosInstance.get(`${EXCHANGES_ENDPOINT}/my/${id}`);
    return response.data;
  },
};
