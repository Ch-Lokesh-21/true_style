import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productImageService } from '../services/productImageService';
import type { ProductImageCreate, ProductImageUpdate, ProductImageListParams } from '../types';

export const useProductImages = (params?: ProductImageListParams) => {
  return useQuery({
    queryKey: ['product-images', params],
    queryFn: () => productImageService.list(params),
  });
};

export const useProductImage = (id: string) => {
  return useQuery({
    queryKey: ['product-images', id],
    queryFn: () => productImageService.get(id),
    enabled: !!id,
  });
};

export const useCreateProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductImageCreate) => productImageService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-images'] });
    },
  });
};

export const useUpdateProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductImageUpdate }) =>
      productImageService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-images'] });
    },
  });
};

export const useDeleteProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productImageService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-images'] });
    },
  });
};
