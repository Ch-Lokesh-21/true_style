import React from 'react';
import { Grid, Box, Skeleton } from '@mui/material';
import { ProductCard } from '../ProductCard';
import type { Product } from '../../types';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  wishlistedIds?: Set<string>;
  onWishlistToggle?: (productId: string) => void;
  showWishlist?: boolean;
  columns?: { xs?: number; sm?: number; md?: number; lg?: number };
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  wishlistedIds = new Set(),
  onWishlistToggle,
  showWishlist = true,
  columns = { xs: 2, sm: 2, md: 3, lg: 4 },
}) => {
  if (loading) {
    return (
      <Grid container spacing={2}>
        {[...Array(8)].map((_, index) => (
          <Grid key={index} size={{ xs: 6, sm: 6, md: 4, lg: 3 }}>
            <Box>
              <Skeleton
                variant="rectangular"
                sx={{ aspectRatio: '3/4', width: '100%' }}
              />
              <Box sx={{ p: 2 }}>
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {products.map((product) => (
        <Grid
          key={product._id}
          size={{
            xs: 12 / (columns.xs || 2),
            sm: 12 / (columns.sm || 2),
            md: 12 / (columns.md || 3),
            lg: 12 / (columns.lg || 4),
          }}
        >
          <ProductCard
            product={product}
            isWishlisted={wishlistedIds.has(product._id)}
            onWishlistToggle={onWishlistToggle}
            showWishlist={showWishlist}
          />
        </Grid>
      ))}
    </Grid>
  );
};
