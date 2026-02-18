import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ratingService } from '../services/ratingService';
import type { RatingListParams } from '../types';
import { toast } from 'react-toastify';

const QUERY_KEY = 'admin-ratings';

export const useRatings = (params?: RatingListParams) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => ratingService.list(params),
  });
};

export const useRating = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => ratingService.get(id),
    enabled: !!id,
  });
};

export const useDeleteRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ratingService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Rating deleted successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to delete rating');
    },
  });
};
