import axiosInstance from '../../../../lib/axios';
import { API_ENDPOINTS } from '../../../../config/constants';
import type { ProductType, Category, Occasion, Brand, OrderStatus, ReturnStatus, ExchangeStatus, ReviewStatus } from '../types';

export const lookupService = {
  // Product Types (Men, Women, Ethnic, etc.)
  getProductTypes: async (): Promise<ProductType[]> => {
    const response = await axiosInstance.get(API_ENDPOINTS.PRODUCT_TYPES);
    return response.data;
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const response = await axiosInstance.get(API_ENDPOINTS.CATEGORIES);
    return response.data;
  },

  // Occasions
  getOccasions: async (): Promise<Occasion[]> => {
    const response = await axiosInstance.get(API_ENDPOINTS.OCCASIONS);
    return response.data;
  },

  // Brands
  getBrands: async (): Promise<Brand[]> => {
    const response = await axiosInstance.get(API_ENDPOINTS.BRANDS);
    return response.data;
  },

  // Status Lookups
  getOrderStatuses: async (): Promise<OrderStatus[]> => {
    const response = await axiosInstance.get(API_ENDPOINTS.UTILITY.ORDER_STATUS);
    return response.data;
  },

  getReturnStatuses: async (): Promise<ReturnStatus[]> => {
    const response = await axiosInstance.get(API_ENDPOINTS.UTILITY.RETURN_STATUS);
    return response.data;
  },

  getExchangeStatuses: async (): Promise<ExchangeStatus[]> => {
    const response = await axiosInstance.get(API_ENDPOINTS.UTILITY.EXCHANGE_STATUS);
    return response.data;
  },

  getReviewStatuses: async (): Promise<ReviewStatus[]> => {
    const response = await axiosInstance.get(API_ENDPOINTS.UTILITY.REVIEW_STATUS);
    return response.data;
  },
};
