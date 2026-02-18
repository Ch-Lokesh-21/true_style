import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../services/reviewService';
import type { ReviewUpdate, ReviewListParams } from '../types';
import { toast } from 'react-toastify';

const QUERY_KEY = 'admin-reviews';
const STATUS_QUERY_KEY = 'review-statuses';

export const useReviews = (params?: ReviewListParams) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => reviewService.list(params),
  });
};

export const useReview = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => reviewService.get(id),
    enabled: !!id,
  });
};

export const useUpdateReviewStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewUpdate }) =>
      reviewService.updateStatus(id, data.review_status_id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Review status updated successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to update review status');
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Review deleted successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to delete review');
    },
  });
};

export const useReviewStatuses = () => {
  return useQuery({
    queryKey: [STATUS_QUERY_KEY],
    queryFn: () => reviewService.getStatuses(),
  });
};
