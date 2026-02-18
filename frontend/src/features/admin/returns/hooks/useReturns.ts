import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { returnService } from '../services/returnService';
import type { ReturnUpdate, ReturnListParams } from '../types';
import { toast } from 'react-toastify';

const QUERY_KEY = 'admin-returns';
const STATUS_QUERY_KEY = 'return-statuses';

export const useReturns = (params?: ReturnListParams) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => returnService.list(params),
  });
};

export const useReturn = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => returnService.get(id),
    enabled: !!id,
  });
};

export const useUpdateReturnStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReturnUpdate }) =>
      returnService.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Return status updated successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to update return status');
    },
  });
};

export const useDeleteReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => returnService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Return deleted successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to delete return');
    },
  });
};

export const useReturnStatuses = () => {
  return useQuery({
    queryKey: [STATUS_QUERY_KEY],
    queryFn: () => returnService.getStatuses(),
  });
};
