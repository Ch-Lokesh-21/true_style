import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { lookupService } from '../../shared/services/lookupService';
import type { ProductListParams } from '../types';

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: ProductListParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  images: (productId: string) => [...productKeys.all, 'images', productId] as const,
};

export const lookupKeys = {
  productTypes: ['productTypes'] as const,
  categories: ['categories'] as const,
  occasions: ['occasions'] as const,
  brands: ['brands'] as const,
  orderStatuses: ['orderStatuses'] as const,
  returnStatuses: ['returnStatuses'] as const,
  exchangeStatuses: ['exchangeStatuses'] as const,
  reviewStatuses: ['reviewStatuses'] as const,
};

// ========== Product Hooks ==========
export const useProducts = (params?: ProductListParams) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productService.list(params),
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.get(id),
    enabled: !!id,
  });
};

export const useProductImages = (productId: string) => {
  return useQuery({
    queryKey: productKeys.images(productId),
    queryFn: () => productService.getImages(productId),
    enabled: !!productId,
  });
};

// ========== Lookup Hooks ==========
export const useProductTypes = () => {
  return useQuery({
    queryKey: lookupKeys.productTypes,
    queryFn: lookupService.getProductTypes,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: lookupKeys.categories,
    queryFn: lookupService.getCategories,
    staleTime: 5 * 60 * 1000,
  });
};

export const useOccasions = () => {
  return useQuery({
    queryKey: lookupKeys.occasions,
    queryFn: lookupService.getOccasions,
    staleTime: 5 * 60 * 1000,
  });
};

export const useBrands = () => {
  return useQuery({
    queryKey: lookupKeys.brands,
    queryFn: lookupService.getBrands,
    staleTime: 5 * 60 * 1000,
  });
};

export const useOrderStatuses = () => {
  return useQuery({
    queryKey: lookupKeys.orderStatuses,
    queryFn: lookupService.getOrderStatuses,
    staleTime: 5 * 60 * 1000,
  });
};

export const useReturnStatuses = () => {
  return useQuery({
    queryKey: lookupKeys.returnStatuses,
    queryFn: lookupService.getReturnStatuses,
    staleTime: 5 * 60 * 1000,
  });
};

export const useExchangeStatuses = () => {
  return useQuery({
    queryKey: lookupKeys.exchangeStatuses,
    queryFn: lookupService.getExchangeStatuses,
    staleTime: 5 * 60 * 1000,
  });
};

export const useReviewStatuses = () => {
  return useQuery({
    queryKey: lookupKeys.reviewStatuses,
    queryFn: lookupService.getReviewStatuses,
    staleTime: 5 * 60 * 1000,
  });
};
