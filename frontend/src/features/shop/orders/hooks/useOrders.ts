import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import { productService } from '../../products/services/productService';
import { toast } from 'react-toastify';
import { cartKeys } from '../../cart/hooks/useCart';
import type { OrderItemEnriched, OrderItem } from '../types';
import type { RazorpayPaymentData } from '../../checkout/types';

export const orderKeys = {
  all: ['orders'] as const,
  myList: () => [...orderKeys.all, 'my', 'list'] as const,
  myDetail: (id: string) => [...orderKeys.all, 'my', 'detail', id] as const,
  items: (orderId: string) => [...orderKeys.all, 'items', orderId] as const,
  myItems: () => [...orderKeys.all, 'my', 'items'] as const,
};

export const useMyOrders = (params?: { skip?: number; limit?: number }) => {
  return useQuery({
    queryKey: orderKeys.myList(),
    queryFn: () => orderService.listMyOrders(params),
  });
};

export const useMyOrder = (id: string) => {
  return useQuery({
    queryKey: orderKeys.myDetail(id),
    queryFn: () => orderService.getMyOrder(id),
    enabled: !!id,
  });
};

export const useOrderItems = (orderId: string) => {
  return useQuery({
    queryKey: orderKeys.items(orderId),
    queryFn: () => orderService.listOrderItems(orderId),
    enabled: !!orderId,
  });
};

export const useMyOrderItems = (params?: { skip?: number; limit?: number }) => {
  return useQuery({
    queryKey: orderKeys.myItems(),
    queryFn: () => orderService.listMyOrderItems(params),
  });
};

export const useInitiateOrder = () => {
  return useMutation({
    mutationFn: (addressId: string) => orderService.initiateOrder(addressId),
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to initiate order');
    },
  });
};

export const useConfirmOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ addressId, paymentData }: { addressId: string; paymentData: RazorpayPaymentData }) =>
      orderService.confirmOrder(addressId, paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      toast.success('Order placed successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to confirm order');
    },
  });
};

export const usePlaceOrderCOD = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => orderService.placeOrderCOD(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      toast.success('Order placed successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to place order');
    },
  });
};

export const useUpdateMyOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, statusId }: { id: string; statusId: string }) =>
      orderService.updateMyOrderStatus(id, statusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update order status');
    },
  });
};

// Enriched order items with product details
export const useOrderItemsEnriched = (orderId: string) => {
  const { data: orderItems, isLoading: isLoadingItems, error } = useOrderItems(orderId);

  const productQueries = useQueries({
    queries: (orderItems || []).map((item: OrderItem) => ({
      queryKey: ['products', 'detail', item.product_id],
      queryFn: () => productService.get(item.product_id),
      enabled: !!item.product_id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    })),
  });

  const isLoadingProducts = productQueries.some(query => query.isLoading);
  const isLoading = isLoadingItems || isLoadingProducts;

  const enrichedItems: OrderItemEnriched[] = (orderItems || []).map((item: OrderItem, index: number) => {
    const product = productQueries[index]?.data;
    return {
      ...item,
      product_name: product?.name || 'Unknown Product',
      thumbnail_url: product?.thumbnail_url,
      brand_name: product?.brand_name,
      price: product?.price || 0,
      total_price: product?.total_price || 0,
      out_of_stock: product?.out_of_stock || false,
    };
  });

  return { data: enrichedItems, isLoading, error };
};
