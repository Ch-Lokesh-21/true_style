import axiosInstance from '../../../../lib/axios';
import { API_ENDPOINTS } from '../../../../config/constants';
import type { Product, ProductCreateForm, ProductUpdateForm, ProductListParams } from '../types';

export const productService = {
  list: async (params?: ProductListParams): Promise<Product[]> => {
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    ) : undefined;
    const response = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.PRODUCTS}/admin`, { params: cleanParams });
    return response.data;
  },

  get: async (id: string): Promise<Product> => {
    const response = await axiosInstance.get(`${API_ENDPOINTS.ADMIN.PRODUCTS}/${id}`);
    return response.data;
  },

  create: async (data: ProductCreateForm): Promise<Product> => {
    const formData = new FormData();
    formData.append('brand_id', data.brand_id);
    formData.append('occasion_id', data.occasion_id);
    formData.append('category_id', data.category_id);
    formData.append('product_type_id', data.product_type_id);
    formData.append('name', data.name);
    formData.append('description', data.description);    formData.append('price', String(Number(data.price) || 0));
    formData.append('hsn_code', String(Math.floor(Number(data.hsn_code) || 0)));
    formData.append('gst_percentage', String(Math.floor(Number(data.gst_percentage) || 0)));
    formData.append('gst_amount', String(Number(data.gst_amount) || 0));
    formData.append('total_price', String(Number(data.total_price) || 0));
    formData.append('color', data.color);
    formData.append('quantity', String(Math.floor(Number(data.quantity) || 0)));
    if (data.thumbnail) {
      formData.append('thumbnail', data.thumbnail);
    }

    const response = await axiosInstance.post(API_ENDPOINTS.ADMIN.PRODUCTS, formData);
    return response.data;
  },

  update: async (id: string, data: ProductUpdateForm): Promise<Product> => {
    const formData = new FormData();
    if (data.brand_id) formData.append('brand_id', data.brand_id);
    if (data.occasion_id) formData.append('occasion_id', data.occasion_id);
    if (data.category_id) formData.append('category_id', data.category_id);
    if (data.product_type_id) formData.append('product_type_id', data.product_type_id);
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.price !== undefined) formData.append('price', String(Number(data.price) || 0));
    if (data.hsn_code !== undefined) formData.append('hsn_code', String(Math.floor(Number(data.hsn_code) || 0)));
    if (data.gst_percentage !== undefined) formData.append('gst_percentage', String(Math.floor(Number(data.gst_percentage) || 0)));
    if (data.gst_amount !== undefined) formData.append('gst_amount', String(Number(data.gst_amount) || 0));
    if (data.total_price !== undefined) formData.append('total_price', String(Number(data.total_price) || 0));
    if (data.color) formData.append('color', data.color);
    if (data.quantity !== undefined) formData.append('quantity', String(Math.floor(Number(data.quantity) || 0)));
    if (data.thumbnail) formData.append('thumbnail', data.thumbnail);

    const response = await axiosInstance.put(`${API_ENDPOINTS.ADMIN.PRODUCTS}/${id}`, formData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_ENDPOINTS.ADMIN.PRODUCTS}/${id}`);
  },
};
