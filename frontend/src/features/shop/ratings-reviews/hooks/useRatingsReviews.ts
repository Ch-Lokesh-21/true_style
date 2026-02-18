import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ratingService } from '../services/ratingService';
import { reviewService } from '../services/reviewService';
import { toast } from 'react-toastify';
import type { UserRatingForm, UserReviewForm } from '../types';
import { productKeys } from '../../products/hooks/useProducts';

export const ratingKeys = {
  all: ['ratings'] as const,
  myForProduct: (productId: string) => [...ratingKeys.all, 'my', productId] as const,
};

export const reviewKeys = {
  all: ['reviews'] as const,
  forProduct: (productId: string) => [...reviewKeys.all, 'product', productId] as const,
  myForProduct: (productId: string) => [...reviewKeys.all, 'my', productId] as const,
};

// ========== Rating Hooks ==========
export const useMyRatingForProduct = (productId: string) => {
  return useQuery({
    queryKey: ratingKeys.myForProduct(productId),
    queryFn: () => ratingService.getMyRatingForProduct(productId),
    enabled: !!productId,
  });
};

export const useCreateRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserRatingForm) => ratingService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ratingKeys.myForProduct(variables.product_id) });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.product_id) });
      toast.success('Rating submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit rating');
    },
  });
};

export const useUpdateRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserRatingForm> }) =>
      ratingService.update(id, data),
    onSuccess: (_, variables) => {
      if (variables.data.product_id) {
        queryClient.invalidateQueries({ queryKey: ratingKeys.myForProduct(variables.data.product_id) });
        queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.data.product_id) });
      }
      toast.success('Rating updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update rating');
    },
  });
};

export const useDeleteRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mutationFn: ({ id, productId: _productId }: { id: string; productId: string }) =>
      ratingService.remove(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ratingKeys.myForProduct(variables.productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
      toast.success('Rating deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete rating');
    },
  });
};

// ========== Review Hooks ==========
export const useProductReviews = (productId: string, params?: { skip?: number; limit?: number }) => {
  return useQuery({
    queryKey: reviewKeys.forProduct(productId),
    queryFn: () => reviewService.listForProduct(productId, params),
    enabled: !!productId,
  });
};

export const useMyReviewForProduct = (productId: string) => {
  return useQuery({
    queryKey: reviewKeys.myForProduct(productId),
    queryFn: () => reviewService.getMyReviewForProduct(productId),
    enabled: !!productId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserReviewForm) => reviewService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.forProduct(variables.product_id) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.myForProduct(variables.product_id) });
      toast.success('Review submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit review');
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserReviewForm> }) =>
      reviewService.update(id, data),
    onSuccess: (_, variables) => {
      if (variables.data.product_id) {
        queryClient.invalidateQueries({ queryKey: reviewKeys.forProduct(variables.data.product_id) });
        queryClient.invalidateQueries({ queryKey: reviewKeys.myForProduct(variables.data.product_id) });
      }
      toast.success('Review updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update review');
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mutationFn: ({ id, productId: _productId }: { id: string; productId: string }) =>
      reviewService.remove(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.forProduct(variables.productId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.myForProduct(variables.productId) });
      toast.success('Review deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete review');
    },
  });
};
