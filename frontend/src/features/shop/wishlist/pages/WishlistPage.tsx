import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Delete,
  ShoppingBagOutlined,
  FavoriteBorder,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../app/store';
import { useWishlistEnriched, useRemoveFromWishlist, useMoveWishlistToCart } from '../hooks/useWishlist';
import { ROUTES } from '../../../../config/constants';
import type { WishlistItemEnriched } from '../types';

// Available sizes
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Size Selection Dialog
const SizeDialog: React.FC<{
  open: boolean;
  item: WishlistItemEnriched | null;
  onClose: () => void;
  onSelect: (size: string) => void;
}> = ({ open, item, onClose, onSelect }) => {
  const [selectedSize, setSelectedSize] = useState('');

  const handleSelect = () => {
    if (selectedSize) {
      onSelect(selectedSize);
      setSelectedSize('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        Select Size
        <Typography variant="body2" color="text.secondary">
          {item?.product_name}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <ToggleButtonGroup
          value={selectedSize}
          exclusive
          onChange={(_e, value) => value && setSelectedSize(value)}
          sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}
        >
          {SIZES.map((size) => (
            <ToggleButton
              key={size}
              value={size}
              sx={{
                width: 56,
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSelect}
          disabled={!selectedSize}
          sx={{ backgroundColor: '#000' }}
        >
          Add to Bag
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Wishlist Item Card
const WishlistItemCard: React.FC<{
  item: WishlistItemEnriched;
  onRemove: () => void;
  onMoveToCart: () => void;
}> = ({ item, onRemove, onMoveToCart }) => {
  return (
    <Card elevation={0} sx={{ borderRadius: 0, position: 'relative' }}>
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1,
        }}
      >
        <IconButton
          size="small"
          onClick={onRemove}
          sx={{ backgroundColor: 'white', '&:hover': { backgroundColor: '#f5f5f5' } }}
        >
          <Delete fontSize="small" />
        </IconButton>
      </Box>

      <CardMedia
        component="img"
        image={item.thumbnail_url || '/placeholder.jpg'}
        alt={item.product_name}
        sx={{
          aspectRatio: '3/4',
          objectFit: 'cover',
          backgroundColor: '#f5f5f5',
          cursor: 'pointer',
        }}
        onClick={() => window.location.href = `/products/${item.product_id}`}
      />

      <CardContent sx={{ px: 1, pt: 1.5, pb: 2 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
        >
          {item.brand_name}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mb: 0.5,
          }}
        >
          {item.product_name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            ₹{item.total_price.toLocaleString('en-IN')}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          fullWidth
          onClick={onMoveToCart}
          disabled={item.out_of_stock}
          sx={{
            borderRadius: 0,
            borderColor: '#000',
            color: '#000',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            '&:hover': {
              borderColor: '#000',
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          {item.out_of_stock ? 'Out of Stock' : 'Move to Bag'}
        </Button>
      </CardContent>
    </Card>
  );
};

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();

  // Auth state
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Local state
  const [sizeDialogOpen, setSizeDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WishlistItemEnriched | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch data
  const { data: wishlistItems, isLoading } = useWishlistEnriched();
  const removeFromWishlist = useRemoveFromWishlist();
  const moveToCart = useMoveWishlistToCart();

  // Handlers
  const handleRemove = useCallback(
    (itemId: string) => {
      removeFromWishlist.mutate(itemId, {
        onSuccess: () => {
          setSnackbar({ open: true, message: 'Removed from wishlist', severity: 'success' });
        },
      });
    },
    [removeFromWishlist]
  );

  const handleMoveToCart = useCallback((item: WishlistItemEnriched) => {
    setSelectedItem(item);
    setSizeDialogOpen(true);
  }, []);

  const handleSizeSelect = useCallback(
    (size: string) => {
      if (!selectedItem) return;

      moveToCart.mutate(
        { id: selectedItem._id, size },
        {
          onSuccess: () => {
            setSnackbar({ open: true, message: 'Added to bag!', severity: 'success' });
          },
          onError: () => {
            setSnackbar({ open: true, message: 'Failed to add to bag', severity: 'error' });
          },
        }
      );
    },
    [selectedItem, moveToCart]
  );

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <FavoriteBorder sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Please login to view your wishlist
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate(ROUTES.LOGIN)}
          sx={{ mt: 2, backgroundColor: '#000' }}
        >
          Login
        </Button>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 4 }} />
        <Grid container spacing={2}>
          {[...Array(4)].map((_, index) => (
            <Grid key={index} size={{ xs: 6, sm: 4, md: 3 }}>
              <Skeleton variant="rectangular" sx={{ aspectRatio: '3/4', mb: 1 }} />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="40%" />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  // Empty wishlist
  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <FavoriteBorder sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Your wishlist is empty
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Save items you love to your wishlist
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/products')}
          sx={{ backgroundColor: '#000' }}
        >
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 500, mb: 4 }}>
          My Wishlist ({wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'})
        </Typography>

        <Grid container spacing={2}>
          {wishlistItems.map((item) => (
            <Grid key={item._id} size={{ xs: 6, sm: 4, md: 3 }}>
              <WishlistItemCard
                item={item}
                onRemove={() => handleRemove(item._id)}
                onMoveToCart={() => handleMoveToCart(item)}
              />
            </Grid>
          ))}
        </Grid>

        {/* Continue Shopping */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/products')}
            startIcon={<ShoppingBagOutlined />}
            sx={{
              borderRadius: 0,
              borderColor: '#000',
              color: '#000',
              px: 4,
              py: 1.5,
              '&:hover': {
                borderColor: '#000',
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            Continue Shopping
          </Button>
        </Box>
      </Container>

      {/* Size Selection Dialog */}
      <SizeDialog
        open={sizeDialogOpen}
        item={selectedItem}
        onClose={() => setSizeDialogOpen(false)}
        onSelect={handleSizeSelect}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
