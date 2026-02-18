import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '../services/cartService';
import { toast } from 'react-toastify';

export const cartKeys = {
  all: ['cart'] as const,
  list: () => [...cartKeys.all, 'list'] as const,
  item: (id: string) => [...cartKeys.all, 'item', id] as const,
  availability: () => [...cartKeys.all, 'availability'] as const,
};

export const useCart = () => {
  return useQuery({
    queryKey: cartKeys.list(),
    queryFn: () => cartService.list(),
  });
};

export const useCartItem = (id: string) => {
  return useQuery({
    queryKey: cartKeys.item(id),
    queryFn: () => cartService.get(id),
    enabled: !!id,
  });
};

export const useCartAvailability = () => {
  return useQuery({
    queryKey: cartKeys.availability(),
    queryFn: () => cartService.checkAvailability(),
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, size, quantity = 1 }: { productId: string; size: string; quantity?: number }) =>
      cartService.add(productId, size, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      toast.success('Added to cart');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add to cart');
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { quantity?: number; size?: string } }) =>
      cartService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update cart');
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cartService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      toast.success('Removed from cart');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove from cart');
    },
  });
};

export const useMoveToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cartService.moveToWishlist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Moved to wishlist');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to move to wishlist');
    },
  });
};
