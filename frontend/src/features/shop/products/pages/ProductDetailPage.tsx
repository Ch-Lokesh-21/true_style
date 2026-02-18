import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  IconButton,
  Chip,
  Breadcrumbs,
  Link,
  Rating,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  FavoriteBorder,
  Favorite,
  Share,
  LocalShipping,
  Autorenew,
  ExpandMore,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../app/store';
import { useProduct, useProductImages } from '../hooks/useProducts';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '../../wishlist/hooks/useWishlist';
import { useAddToCart } from '../../cart/hooks/useCart';
import { useMyRatingForProduct, useCreateRating, useProductReviews } from '../../ratings-reviews/hooks/useRatingsReviews';
import { LoginRequiredModal } from '../../shared/components/LoginRequiredModal';

// Available sizes (would ideally come from product type)
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Auth state
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Local state
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginAction, setLoginAction] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch data
  const { data: product, isLoading: loadingProduct, isError } = useProduct(id || '');
  const { data: productImages } = useProductImages(id || '');
  const { data: reviews } = useProductReviews(id || '');
  const { data: wishlistItems } = useWishlist();
  const { data: myRating } = useMyRatingForProduct(id || '');
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const addToCart = useAddToCart();
  const createRating = useCreateRating();

  // All images (thumbnail + product images)
  const allImages = useMemo(() => {
    const images: string[] = [];
    if (product?.thumbnail_url) {
      images.push(product.thumbnail_url);
    }
    if (productImages) {
      productImages
        .sort((a, b) => a.idx - b.idx)
        .forEach(img => images.push(img.image_url));
    }
    return images;
  }, [product, productImages]);

  // Check if product is wishlisted
  const wishlistedItem = useMemo(() => {
    return wishlistItems?.find(item => item.product_id === id);
  }, [wishlistItems, id]);

  const isWishlisted = !!wishlistedItem;

  // Handle wishlist toggle
  const handleWishlistToggle = useCallback(() => {
    if (!isAuthenticated) {
      setLoginAction('add items to your wishlist');
      setLoginModalOpen(true);
      return;
    }

    if (wishlistedItem) {
      removeFromWishlist.mutate(wishlistedItem._id);
    } else if (id) {
      addToWishlist.mutate(id);
    }
  }, [isAuthenticated, wishlistedItem, id, addToWishlist, removeFromWishlist]);

  // Handle add to bag
  const handleAddToBag = useCallback(() => {
    if (!isAuthenticated) {
      setLoginAction('add items to your bag');
      setLoginModalOpen(true);
      return;
    }

    if (!selectedSize) {
      setSnackbar({ open: true, message: 'Please select a size', severity: 'error' });
      return;
    }

    if (!id) return;

    addToCart.mutate(
      { productId: id, size: selectedSize, quantity: 1 },
      {
        onSuccess: () => {
          setSnackbar({ open: true, message: 'Added to bag!', severity: 'success' });
        },
        onError: () => {
          setSnackbar({ open: true, message: 'Failed to add to bag', severity: 'error' });
        },
      }
    );
  }, [isAuthenticated, selectedSize, id, addToCart]);

  // Handle rating
  const handleRating = useCallback((_event: React.SyntheticEvent, value: number | null) => {
    if (!isAuthenticated || !user) {
      setLoginAction('rate this product');
      setLoginModalOpen(true);
      return;
    }

    if (!id || value === null) return;

    createRating.mutate({ product_id: id, user_id: user._id, rating: value });
  }, [isAuthenticated, user, id, createRating]);

  if (loadingProduct) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Skeleton variant="rectangular" sx={{ aspectRatio: '1/1', width: '100%' }} />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Skeleton variant="text" width="30%" />
            <Skeleton variant="text" width="80%" height={40} />
            <Skeleton variant="text" width="40%" />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (isError || !product) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5">Product not found</Typography>
        <Button onClick={() => navigate('/products')} sx={{ mt: 2 }}>
          Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link href="/shop" color="inherit" underline="hover">
            Home
          </Link>
          {product.product_type_name && (
            <Link
              href={`/products?product_type=${product.product_type_id}`}
              color="inherit"
              underline="hover"
            >
              {product.product_type_name}
            </Link>
          )}
          <Typography color="text.primary" noWrap sx={{ maxWidth: 200 }}>
            {product.name}
          </Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          {/* Image Gallery */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Thumbnail strip - Desktop */}
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  flexDirection: 'column',
                  gap: 1,
                  width: 80,
                }}
              >
                {allImages.map((img, index) => (
                  <Box
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    sx={{
                      cursor: 'pointer',
                      border: selectedImageIndex === index ? '2px solid #000' : '1px solid #ddd',
                      opacity: selectedImageIndex === index ? 1 : 0.7,
                      '&:hover': { opacity: 1 },
                    }}
                  >
                    <Box
                      component="img"
                      src={img}
                      alt={`View ${index + 1}`}
                      sx={{
                        width: '100%',
                        aspectRatio: '1/1',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                ))}
              </Box>

              {/* Main Image */}
              <Box sx={{ flexGrow: 1, position: 'relative' }}>
                <Box
                  component="img"
                  src={allImages[selectedImageIndex] || product.thumbnail_url}
                  alt={product.name}
                  sx={{
                    width: '100%',
                    aspectRatio: '3/4',
                    objectFit: 'cover',
                    backgroundColor: '#f5f5f5',
                  }}
                />

                {/* New Badge */}
                <Chip
                  label="New"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    backgroundColor: '#000',
                    color: '#fff',
                    borderRadius: 0,
                  }}
                />
              </Box>
            </Box>

            {/* Image thumbnails - Mobile horizontal scroll */}
            <Box
              sx={{
                display: { xs: 'flex', md: 'none' },
                gap: 1,
                mt: 2,
                overflowX: 'auto',
                pb: 1,
              }}
            >
              {allImages.map((img, index) => (
                <Box
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  sx={{
                    cursor: 'pointer',
                    width: 60,
                    height: 80,
                    flexShrink: 0,
                    border: selectedImageIndex === index ? '2px solid #000' : '1px solid #ddd',
                  }}
                >
                  <Box
                    component="img"
                    src={img}
                    alt={`View ${index + 1}`}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Product Info */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ position: 'sticky', top: 80 }}>
              {/* Brand */}
              {product.brand_name && (
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ letterSpacing: 1 }}
                >
                  {product.brand_name}
                </Typography>
              )}

              {/* Title & Actions */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 400, flexGrow: 1 }}>
                  {product.name}
                </Typography>
                <IconButton onClick={handleWishlistToggle}>
                  {isWishlisted ? (
                    <Favorite sx={{ color: 'error.main' }} />
                  ) : (
                    <FavoriteBorder />
                  )}
                </IconButton>
                <IconButton>
                  <Share />
                </IconButton>
              </Box>

              {/* Price */}
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 500 }}>
                  ₹{product.total_price.toLocaleString('en-IN')}
                </Typography>
                {product.price !== product.total_price && (
                  <Typography
                    variant="body1"
                    sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                  >
                    ₹{product.price.toLocaleString('en-IN')}
                  </Typography>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                MRP incl. of all taxes
              </Typography>

              {/* Rating */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Rating
                  value={myRating?.rating || product.rating || 0}
                  onChange={handleRating}
                  precision={0.5}
                />
                <Typography variant="body2" color="text.secondary">
                  ({product.rating?.toFixed(1) || 'No ratings'})
                </Typography>
                {reviews && reviews.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {reviews.length} reviews
                  </Typography>
                )}
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Color */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  COLOR
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={product.color}
                    variant="outlined"
                    sx={{
                      borderRadius: 0,
                      backgroundColor: product.color.toLowerCase(),
                      color: ['white', 'yellow', 'beige'].includes(product.color.toLowerCase())
                        ? '#000'
                        : '#fff',
                    }}
                  />
                </Box>
              </Box>

              {/* Size Selection */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2">SIZE</Typography>
                  <Link
                    href={product.product_type_id ? `/size-chart/${product.product_type_id}` : '#'}
                    underline="always"
                    sx={{ fontSize: '0.875rem' }}
                  >
                    SIZE GUIDE
                  </Link>
                </Box>
                <ToggleButtonGroup
                  value={selectedSize}
                  exclusive
                  onChange={(_e, value) => value && setSelectedSize(value)}
                  sx={{ flexWrap: 'wrap', gap: 1 }}
                >
                  {SIZES.map((size) => (
                    <ToggleButton
                      key={size}
                      value={size}
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 0,
                        border: '1px solid #ddd',
                        '&.Mui-selected': {
                          backgroundColor: '#000',
                          color: '#fff',
                          '&:hover': {
                            backgroundColor: '#333',
                          },
                        },
                      }}
                    >
                      {size}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>

              {/* Add to Bag Button */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleAddToBag}
                disabled={product.out_of_stock || addToCart.isPending}
                sx={{
                  backgroundColor: '#000',
                  '&:hover': { backgroundColor: '#333' },
                  py: 1.5,
                  borderRadius: 0,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  mb: 3,
                }}
              >
                {product.out_of_stock ? 'Out of Stock' : 'Add to Bag'}
              </Button>

              {/* Features */}
              <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalShipping sx={{ fontSize: 24 }} />
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      Free shipping
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Autorenew sx={{ fontSize: 24 }} />
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      Fresh Fashion
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Product Details Accordion */}
              <Accordion defaultExpanded elevation={0} sx={{ '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0 }}>
                  <Typography variant="subtitle1" fontWeight={500}>
                    Product Details and Overview
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0 }}>
                  <Box sx={{ '& > div': { mb: 1.5 } }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        SKU:
                      </Typography>
                      <Typography variant="body2">{product._id}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        HSN Code:
                      </Typography>
                      <Typography variant="body2">{product.hsn_code}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        {product.description}
                      </Typography>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion elevation={0} sx={{ '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0 }}>
                  <Typography variant="subtitle1" fontWeight={500}>
                    Delivery & Return
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0 }}>
                  <Typography variant="body2" color="text.secondary">
                    Free shipping on orders above ₹999. Easy returns within 7 days of delivery.
                    Exchange available for different size.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Box>
          </Grid>
        </Grid>

        {/* Reviews Section */}
        {reviews && reviews.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h6" gutterBottom>
              Customer Reviews
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {reviews.map((review: any) => (
              <Box key={review._id} sx={{ py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2">{review.user_name || 'Customer'}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                {review.review && (
                  <Typography variant="body2" color="text.secondary">
                    {review.review}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Container>

      {/* Login Required Modal */}
      <LoginRequiredModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        message={`Please login to ${loginAction}`}
        action={loginAction}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
