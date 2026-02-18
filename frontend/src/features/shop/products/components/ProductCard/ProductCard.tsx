import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Rating,
} from '@mui/material';
import { FavoriteBorder, Favorite } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  isWishlisted?: boolean;
  onWishlistToggle?: (productId: string) => void;
  showWishlist?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted = false,
  onWishlistToggle,
  showWishlist = true,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/products/${product._id}`);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWishlistToggle?.(product._id);
  };

  const discountPercent = product.price !== product.total_price
    ? Math.round(((product.price - product.total_price) / product.price) * 100)
    : 0;

  return (
    <Card
      sx={{
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: 4,
        },
        borderRadius: 0,
        boxShadow: 'none',
        border: 'none',
      }}
      onClick={handleClick}
    >
      {/* New Badge */}
      <Chip
        label="New"
        size="small"
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 1,
          backgroundColor: '#000',
          color: '#fff',
          fontSize: '0.65rem',
          height: 20,
          borderRadius: 0,
        }}
      />

      {/* Wishlist Button */}
      {showWishlist && (
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            },
          }}
          onClick={handleWishlistClick}
          size="small"
        >
          {isWishlisted ? (
            <Favorite sx={{ color: 'error.main', fontSize: 20 }} />
          ) : (
            <FavoriteBorder sx={{ fontSize: 20 }} />
          )}
        </IconButton>
      )}

      {/* Product Image */}
      <CardMedia
        component="img"
        image={product.thumbnail_url}
        alt={product.name}
        sx={{
          aspectRatio: '3/4',
          objectFit: 'cover',
          backgroundColor: '#f5f5f5',
        }}
      />

      {/* Product Info */}
      <CardContent sx={{ flexGrow: 1, p: 2, pb: 2 }}>
        {/* Brand */}
        {product.brand_name && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              textTransform: 'uppercase',
              fontWeight: 500,
              letterSpacing: 0.5,
              fontSize: '0.7rem',
            }}
          >
            {product.brand_name}
          </Typography>
        )}

        {/* Product Name */}
        <Typography
          variant="body2"
          sx={{
            fontWeight: 400,
            mt: 0.5,
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.4,
            minHeight: '2.8em',
          }}
        >
          {product.name}
        </Typography>

        {/* Rating */}
        {product.rating && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating
              value={product.rating}
              precision={0.1}
              size="small"
              readOnly
              sx={{ fontSize: '0.9rem' }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              ({product.rating.toFixed(1)})
            </Typography>
          </Box>
        )}

        {/* Price */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            ₹{product.total_price.toLocaleString('en-IN')}
          </Typography>
          {discountPercent > 0 && (
            <>
              <Typography
                variant="body2"
                sx={{
                  textDecoration: 'line-through',
                  color: 'text.secondary',
                }}
              >
                ₹{product.price.toLocaleString('en-IN')}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'success.main',
                  fontWeight: 500,
                }}
              >
                {discountPercent}% OFF
              </Typography>
            </>
          )}
        </Box>

        {/* Tax Info */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 0.5 }}
        >
          MRP incl. of all taxes
        </Typography>

        {/* Out of Stock */}
        {product.out_of_stock && (
          <Chip
            label="Out of Stock"
            size="small"
            color="error"
            variant="outlined"
            sx={{ mt: 1 }}
          />
        )}
      </CardContent>
    </Card>
  );
};
