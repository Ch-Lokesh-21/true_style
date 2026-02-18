import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { occasionService } from '../services/occasionService';
import type { OccasionCreate, OccasionUpdate, OccasionListParams } from '../types';
import { toast } from 'react-toastify';

const QUERY_KEY = 'occasions';

export const useOccasions = (params?: OccasionListParams) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => occasionService.list(params),
  });
};

export const useOccasion = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => occasionService.get(id),
    enabled: !!id,
  });
};

export const useCreateOccasion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OccasionCreate) => occasionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Occasion created successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to create occasion');
    },
  });
};

export const useUpdateOccasion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OccasionUpdate }) =>
      occasionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Occasion updated successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to update occasion');
    },
  });
};

export const useDeleteOccasion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => occasionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Occasion deleted successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to delete occasion');
    },
  });
};
