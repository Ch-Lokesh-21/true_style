import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  IconButton,
  Divider,
  Select,
  MenuItem,
  FormControl,
  Paper,
  Skeleton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Delete,
  FavoriteBorder,
  ShoppingBagOutlined,
  LocalShipping,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../app/store';
import { useCartAvailability, useUpdateCartItem, useRemoveFromCart, useMoveToWishlist } from '../hooks/useCart';
import { useAddresses, useCreateAddress } from '../../addresses/hooks/useAddresses';
import { ROUTES } from '../../../../config/constants';
import type { CartItemAvailability } from '../types';
import type { UserAddressForm } from '../../addresses/types';

// Address Form Component
const AddressDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (address: UserAddressForm) => void;
}> = ({ open, onClose, onSubmit }) => {
  const [address, setAddress] = useState<UserAddressForm>({
    mobile_no: '',
    postal_code: 0,
    country: 'India',
    state: '',
    city: '',
    address: '',
  });

  const handleSubmit = () => {
    if (address.address && address.city && address.state && address.postal_code && address.mobile_no) {
      onSubmit(address);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Address</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <Typography variant="caption" color="text.secondary">Mobile Number *</Typography>
            <input
              style={{ padding: '12px', border: '1px solid #ddd' }}
              value={address.mobile_no}
              onChange={(e) => setAddress({ ...address, mobile_no: e.target.value })}
              placeholder="10-digit mobile number"
            />
          </FormControl>
          <FormControl fullWidth>
            <Typography variant="caption" color="text.secondary">Address *</Typography>
            <input
              style={{ padding: '12px', border: '1px solid #ddd' }}
              value={address.address}
              onChange={(e) => setAddress({ ...address, address: e.target.value })}
              placeholder="House No., Building, Street, Area"
            />
          </FormControl>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">City *</Typography>
              <input
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd' }}
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">State *</Typography>
              <input
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd' }}
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">Postal Code *</Typography>
              <input
                type="number"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd' }}
                value={address.postal_code || ''}
                onChange={(e) => setAddress({ ...address, postal_code: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">Country</Typography>
              <input
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd' }}
                value={address.country}
                onChange={(e) => setAddress({ ...address, country: e.target.value })}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} sx={{ backgroundColor: '#000' }}>
          Save Address
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Cart Item Row
const CartItemRow: React.FC<{
  item: CartItemAvailability;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  onMoveToWishlist: () => void;
  isUpdating: boolean;
}> = ({ item, onQuantityChange, onRemove, onMoveToWishlist, isUpdating }) => {
  return (
    <Box sx={{ py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Grid container spacing={2}>
        {/* Product Image */}
        <Grid size={{ xs: 3, sm: 2 }}>
          <Box
            component="img"
            src={item.thumbnail_url || '/placeholder.jpg'}
            alt={item.product_name}
            sx={{
              width: '100%',
              aspectRatio: '3/4',
              objectFit: 'cover',
              backgroundColor: '#f5f5f5',
            }}
          />
        </Grid>

        {/* Product Details */}
        <Grid size={{ xs: 9, sm: 10 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Title & Price - Top row */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {item.product_name}
                </Typography>
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, ml: 2 }}>
                ₹{item.subtotal.toLocaleString('en-IN')}
              </Typography>
            </Box>

            {/* Size & Availability */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Size: {item.size}
              </Typography>
              {!item.available && (
                <Typography variant="body2" color="error">
                  {item.message || 'Out of stock'}
                </Typography>
              )}
            </Box>

            {/* Quantity & Actions - Bottom row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 80 }}>
                  <Select
                    value={item.requested_quantity}
                    onChange={(e) => onQuantityChange(Number(e.target.value))}
                    disabled={isUpdating}
                    sx={{ borderRadius: 0 }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((qty) => (
                      <MenuItem key={qty} value={qty}>
                        Qty: {qty}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography variant="body2" color="text.secondary">
                  ₹{item.price.toLocaleString('en-IN')} each
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={onMoveToWishlist}
                  title="Move to Wishlist"
                >
                  <FavoriteBorder />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={onRemove}
                  title="Remove"
                >
                  <Delete />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export const CartPage: React.FC = () => {
  const navigate = useNavigate();

  // Auth state
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Local state
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch data - use availability check for enriched cart items
  const { data: cartData, isLoading: loadingCart } = useCartAvailability();
  const { data: addresses } = useAddresses();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const moveToWishlist = useMoveToWishlist();
  const createAddress = useCreateAddress();

  // Set default address (first address as default since backend doesn't have is_default)
  React.useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddress) {
      const firstAddress = addresses[0];
      if (firstAddress._id) {
        setSelectedAddress(firstAddress._id);
      }
    }
  }, [addresses, selectedAddress]);

  // Calculations from availability response
  const { total, itemCount } = useMemo(() => {
    if (!cartData) {
      return { total: 0, itemCount: 0 };
    }
    return {
      total: cartData.total_amount,
      itemCount: cartData.total_quantity,
    };
  }, [cartData]);

  // Handlers
  const handleQuantityChange = useCallback(
    (itemId: string, quantity: number) => {
      updateCartItem.mutate({ id: itemId, data: { quantity } });
    },
    [updateCartItem]
  );

  const handleRemove = useCallback(
    (itemId: string) => {
      removeFromCart.mutate(itemId);
    },
    [removeFromCart]
  );

  const handleMoveToWishlist = useCallback(
    (itemId: string) => {
      moveToWishlist.mutate(itemId, {
        onSuccess: () => {
          setSnackbar({ open: true, message: 'Moved to wishlist', severity: 'success' });
        },
      });
    },
    [moveToWishlist]
  );

  const handleAddAddress = useCallback(
    (address: UserAddressForm) => {
      createAddress.mutate(address, {
        onSuccess: (newAddress) => {
          if (newAddress._id) {
            setSelectedAddress(newAddress._id);
          }
          setSnackbar({ open: true, message: 'Address added', severity: 'success' });
        },
      });
    },
    [createAddress]
  );

  const handleCheckout = useCallback(() => {
    if (!selectedAddress) {
      setSnackbar({ open: true, message: 'Please select a delivery address', severity: 'error' });
      return;
    }
    if (!cartData?.all_available) {
      setSnackbar({ open: true, message: 'Some items are unavailable. Please update your cart.', severity: 'error' });
      return;
    }
    navigate(`/checkout?address=${selectedAddress}`);
  }, [selectedAddress, navigate, cartData]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <ShoppingBagOutlined sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Please login to view your cart
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

  if (loadingCart) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rectangular" height={200} sx={{ my: 2 }} />
        <Skeleton variant="rectangular" height={200} />
      </Container>
    );
  }

  // Empty cart
  if (!cartData || cartData.items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <ShoppingBagOutlined sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Your bag is empty
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Add items to your bag to checkout
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
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9f9f9' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 500, mb: 3 }}>
          Shopping Bag ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </Typography>

        <Grid container spacing={3}>
          {/* Cart Items */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 0 }}>
              {/* Delivery Address */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={500}>
                    Delivery Address
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setAddressDialogOpen(true)}
                    sx={{ textTransform: 'none' }}
                  >
                    + Add New
                  </Button>
                </Box>

                {addresses && addresses.length > 0 ? (
                  <FormControl fullWidth size="small">
                    <Select
                      value={selectedAddress}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                      sx={{ borderRadius: 0 }}
                    >
                      {addresses.map((addr) => (
                        <MenuItem key={addr._id} value={addr._id}>
                          {addr.address}, {addr.city} - {addr.postal_code}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setAddressDialogOpen(true)}
                    sx={{ borderRadius: 0 }}
                  >
                    Add Delivery Address
                  </Button>
                )}
              </Box>

              <Divider />

              {/* Cart Items List */}
              {cartData.items.map((item) => (
                <CartItemRow
                  key={item.cart_item_id}
                  item={item}
                  onQuantityChange={(qty) => handleQuantityChange(item.cart_item_id, qty)}
                  onRemove={() => handleRemove(item.cart_item_id)}
                  onMoveToWishlist={() => handleMoveToWishlist(item.cart_item_id)}
                  isUpdating={updateCartItem.isPending}
                />
              ))}
            </Paper>
          </Grid>

          {/* Order Summary */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 0, position: 'sticky', top: 80 }}>
              <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                Order Summary
              </Typography>

              <Box sx={{ my: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Items ({itemCount})</Typography>
                  <Typography variant="body2">₹{total.toLocaleString('en-IN')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Delivery</Typography>
                  <Typography variant="body2" color="success.main">
                    Free
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={500}>
                  Total
                </Typography>
                <Typography variant="subtitle1" fontWeight={500}>
                  ₹{total.toLocaleString('en-IN')}
                </Typography>
              </Box>

              {!cartData.all_available && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Some items are unavailable. Please update your cart.
                </Alert>
              )}

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleCheckout}
                disabled={!cartData.all_available}
                sx={{
                  backgroundColor: '#000',
                  '&:hover': { backgroundColor: '#333' },
                  py: 1.5,
                  borderRadius: 0,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Proceed to Checkout
              </Button>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2 }}>
                <LocalShipping sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  Free shipping on all orders
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Address Dialog */}
      <AddressDialog
        open={addressDialogOpen}
        onClose={() => setAddressDialogOpen(false)}
        onSubmit={handleAddAddress}
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
