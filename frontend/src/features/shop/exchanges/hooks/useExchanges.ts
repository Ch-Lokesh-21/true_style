import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { exchangeService } from '../services/exchangeService';
import { productService } from '../../products/services/productService';
import { toast } from 'react-toastify';
import type { ExchangeCreateForm, ExchangeEnriched, Exchange } from '../types';
import { orderKeys } from '../../orders/hooks/useOrders';

export const exchangeKeys = {
  all: ['exchanges'] as const,
  myList: () => [...exchangeKeys.all, 'my', 'list'] as const,
  myDetail: (id: string) => [...exchangeKeys.all, 'my', 'detail', id] as const,
  options: (orderItemId: string) => [...exchangeKeys.all, 'options', orderItemId] as const,
};

export const useMyExchanges = (params?: { skip?: number; limit?: number }) => {
  return useQuery({
    queryKey: exchangeKeys.myList(),
    queryFn: () => exchangeService.listMyExchanges(params),
  });
};

export const useMyExchange = (id: string) => {
  return useQuery({
    queryKey: exchangeKeys.myDetail(id),
    queryFn: () => exchangeService.getMyExchange(id),
    enabled: !!id,
  });
};

export const useExchangeOptions = (orderItemId: string) => {
  return useQuery({
    queryKey: exchangeKeys.options(orderItemId),
    queryFn: () => exchangeService.getOptions(orderItemId),
    enabled: !!orderItemId,
  });
};

export const useCreateExchange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExchangeCreateForm) => exchangeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exchangeKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success('Exchange request submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit exchange request');
    },
  });
};

// Enriched exchanges with product details
export const useMyExchangesEnriched = (params?: { skip?: number; limit?: number }) => {
  const { data: exchanges, isLoading: isLoadingExchanges, error } = useMyExchanges(params);

  // Fetch product data for each exchange
  const productQueries = useQueries({
    queries: (exchanges || []).map((exchange: Exchange) => ({
      queryKey: ['products', 'detail', exchange.product_id],
      queryFn: () => productService.get(exchange.product_id),
      enabled: !!exchange.product_id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    })),
  });

  const isLoadingProducts = productQueries.some(query => query.isLoading);
  const isLoading = isLoadingExchanges || isLoadingProducts;

  const enrichedExchanges: ExchangeEnriched[] = (exchanges || []).map((exchange: Exchange, index: number) => {
    const product = productQueries[index]?.data;
    
    return {
      ...exchange,
      product_name: product?.name || 'Unknown Product',
      thumbnail_url: product?.thumbnail_url,
      brand_name: product?.brand_name,
      price: product?.price || 0,
    };
  });

  return { data: enrichedExchanges, isLoading, error };
};
