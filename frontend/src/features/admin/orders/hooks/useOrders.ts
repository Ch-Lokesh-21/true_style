import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import type { OrderUpdate, OrderListParams } from '../types';
import { toast } from 'react-toastify';

const QUERY_KEY = 'admin-orders';
const STATUS_QUERY_KEY = 'order-statuses';

export const useOrders = (params?: OrderListParams) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => orderService.list(params),
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => orderService.get(id),
    enabled: !!id,
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OrderUpdate }) =>
      orderService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Order updated successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to update order');
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Order deleted successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to delete order');
    },
  });
};

export const useOrderStatuses = () => {
  return useQuery({
    queryKey: [STATUS_QUERY_KEY],
    queryFn: () => orderService.getStatuses(),
  });
};
