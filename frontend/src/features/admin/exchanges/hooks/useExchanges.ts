import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exchangeService } from '../services/exchangeService';
import type { ExchangeUpdate, ExchangeListParams } from '../types';
import { toast } from 'react-toastify';

const QUERY_KEY = 'admin-exchanges';
const STATUS_QUERY_KEY = 'exchange-statuses';

export const useExchanges = (params?: ExchangeListParams) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => exchangeService.list(params),
  });
};

export const useExchange = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => exchangeService.get(id),
    enabled: !!id,
  });
};

export const useUpdateExchangeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExchangeUpdate }) =>
      exchangeService.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Exchange status updated successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to update exchange status');
    },
  });
};

export const useDeleteExchange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => exchangeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Exchange deleted successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to delete exchange');
    },
  });
};

export const useExchangeStatuses = () => {
  return useQuery({
    queryKey: [STATUS_QUERY_KEY],
    queryFn: () => exchangeService.getStatuses(),
  });
};
