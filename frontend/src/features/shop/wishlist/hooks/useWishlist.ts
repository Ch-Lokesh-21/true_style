import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { wishlistService } from '../services/wishlistService';
import { productService } from '../../products/services/productService';
import { toast } from 'react-toastify';
import { cartKeys } from '../../cart/hooks/useCart';
import type { WishlistItemEnriched } from '../types';

export const wishlistKeys = {
  all: ['wishlist'] as const,
  list: () => [...wishlistKeys.all, 'list'] as const,
  enriched: () => [...wishlistKeys.all, 'enriched'] as const,
  item: (id: string) => [...wishlistKeys.all, 'item', id] as const,
};

export const useWishlist = () => {
  return useQuery({
    queryKey: wishlistKeys.list(),
    queryFn: () => wishlistService.list(),
  });
};

// Enriched wishlist hook that fetches product details for each item
export const useWishlistEnriched = () => {
  const { data: wishlistItems, isLoading: loadingWishlist } = useWishlist();
  
  const productIds = wishlistItems?.map(item => item.product_id) || [];
  
  const productQueries = useQueries({
    queries: productIds.map(productId => ({
      queryKey: ['product', productId],
      queryFn: () => productService.get(productId),
      enabled: !!productId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    })),
  });
  
  const isLoading = loadingWishlist || productQueries.some(q => q.isLoading);
  
  // Merge wishlist items with product data
  const enrichedItems: WishlistItemEnriched[] = (wishlistItems || []).map((item, index) => {
    const product = productQueries[index]?.data;
    return {
      ...item,
      product_name: product?.name || 'Loading...',
      thumbnail_url: product?.thumbnail_url,
      brand_name: product?.brand_name,
      price: product?.price || 0,
      total_price: product?.total_price || 0,
      out_of_stock: product?.out_of_stock || false,
    };
  });
  
  return {
    data: enrichedItems,
    isLoading,
  };
};

export const useWishlistItem = (id: string) => {
  return useQuery({
    queryKey: wishlistKeys.item(id),
    queryFn: () => wishlistService.get(id),
    enabled: !!id,
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => wishlistService.add(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
      toast.success('Added to wishlist');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add to wishlist');
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => wishlistService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
      toast.success('Removed from wishlist');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove from wishlist');
    },
  });
};

export const useMoveWishlistToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, size }: { id: string; size?: string }) =>
      wishlistService.moveToCart(id, size),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      toast.success('Moved to cart');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to move to cart');
    },
  });
};
