import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { returnService } from '../services/returnService';
import { productService } from '../../products/services/productService';
import { orderService } from '../../orders/services/orderService';
import { toast } from 'react-toastify';
import type { ReturnCreateForm, ReturnEnriched, Return } from '../types';
import { orderKeys } from '../../orders/hooks/useOrders';

export const returnKeys = {
  all: ['returns'] as const,
  myList: () => [...returnKeys.all, 'my', 'list'] as const,
  myDetail: (id: string) => [...returnKeys.all, 'my', 'detail', id] as const,
  options: (orderItemId: string) => [...returnKeys.all, 'options', orderItemId] as const,
};

export const useMyReturns = (params?: { skip?: number; limit?: number }) => {
  return useQuery({
    queryKey: returnKeys.myList(),
    queryFn: () => returnService.listMyReturns(params),
  });
};

export const useMyReturn = (id: string) => {
  return useQuery({
    queryKey: returnKeys.myDetail(id),
    queryFn: () => returnService.getMyReturn(id),
    enabled: !!id,
  });
};

export const useReturnOptions = (orderItemId: string) => {
  return useQuery({
    queryKey: returnKeys.options(orderItemId),
    queryFn: () => returnService.getOptions(orderItemId),
    enabled: !!orderItemId,
  });
};

export const useCreateReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReturnCreateForm) => returnService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: returnKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success('Return request submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit return request');
    },
  });
};

// Enriched returns with product and order item details
export const useMyReturnsEnriched = (params?: { skip?: number; limit?: number }) => {
  const { data: returns, isLoading: isLoadingReturns, error } = useMyReturns(params);

  // Fetch products and order items for each return
  const enrichmentQueries = useQueries({
    queries: (returns || []).map((returnItem: Return) => ({
      queryKey: ['return-enrichment', returnItem._id, returnItem.product_id, returnItem.order_item_id],
      queryFn: async () => {
        const [product, orderItem] = await Promise.all([
          productService.get(returnItem.product_id),
          orderService.getOrderItem(returnItem.order_item_id),
        ]);
        return { product, orderItem };
      },
      enabled: !!returnItem.product_id && !!returnItem.order_item_id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    })),
  });

  const isLoadingEnrichment = enrichmentQueries.some(query => query.isLoading);
  const isLoading = isLoadingReturns || isLoadingEnrichment;

  const enrichedReturns: ReturnEnriched[] = (returns || []).map((returnItem: Return, index: number) => {
    const enrichment = enrichmentQueries[index]?.data;
    const product = enrichment?.product;
    const orderItem = enrichment?.orderItem;
    
    return {
      ...returnItem,
      product_name: product?.name || 'Unknown Product',
      thumbnail_url: product?.thumbnail_url,
      brand_name: product?.brand_name,
      price: product?.price || 0,
      size: orderItem?.size,
    };
  });

  return { data: enrichedReturns, isLoading, error };
};
