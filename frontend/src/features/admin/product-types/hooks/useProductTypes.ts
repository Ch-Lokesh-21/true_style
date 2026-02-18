import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productTypeService } from '../services/productTypeService';
import type { ProductTypeCreate, ProductTypeUpdate, ProductTypeListParams } from '../types';
import { toast } from 'react-toastify';

const QUERY_KEY = 'product-types';

export const useProductTypes = (params?: ProductTypeListParams) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => productTypeService.list(params),
  });
};

export const useProductType = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => productTypeService.get(id),
    enabled: !!id,
  });
};

export const useCreateProductType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductTypeCreate) => productTypeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Product type created successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to create product type');
    },
  });
};

export const useUpdateProductType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductTypeUpdate }) =>
      productTypeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Product type updated successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to update product type');
    },
  });
};

export const useDeleteProductType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productTypeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Product type deleted successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to delete product type');
    },
  });
};
