import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Divider,
  Skeleton,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CreditCard,
  LocalAtm,
  CheckCircle,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../app/store';
import { useCartAvailability } from '../../cart/hooks/useCart';
import { useAddresses } from '../../addresses/hooks/useAddresses';
import { useInitiateOrder, useConfirmOrder, usePlaceOrderCOD } from '../../orders/hooks/useOrders';
import { ROUTES } from '../../../../config/constants';
import type { UserAddress } from '../../addresses/types';
import type { CartItemAvailability } from '../../cart/types';
import type { RazorpayPaymentData } from '../types';

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Address Card Component
const AddressCard: React.FC<{
  address: UserAddress;
  selected: boolean;
  onSelect: () => void;
}> = ({ address, selected, onSelect }) => {
  return (
    <Paper
      elevation={0}
      onClick={onSelect}
      sx={{
        p: 2,
        border: selected ? '2px solid #000' : '1px solid #ddd',
        borderRadius: 0,
        cursor: 'pointer',
        '&:hover': {
          borderColor: '#000',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <Radio
          checked={selected}
          sx={{ p: 0, mt: 0.5 }}
        />
        <Box>
          <Typography variant="body2">
            {address.address}
          </Typography>
          <Typography variant="body2">
            {address.city}, {address.state} - {address.postal_code}
          </Typography>
          <Typography variant="body2">
            {address.country}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Mobile: {address.mobile_no}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

// Order Item Row
const OrderItemRow: React.FC<{
  item: CartItemAvailability;
}> = ({ item }) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, py: 1.5 }}>
      <Box
        component="img"
        src={item.thumbnail_url || '/placeholder.jpg'}
        alt={item.product_name}
        sx={{
          width: 60,
          height: 80,
          objectFit: 'cover',
          backgroundColor: '#f5f5f5',
        }}
      />
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body2" noWrap>
          {item.product_name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Size: {item.size} | Qty: {item.requested_quantity}
        </Typography>
      </Box>
      <Typography variant="body2" fontWeight={500}>
        ₹{item.subtotal.toLocaleString('en-IN')}
      </Typography>
    </Box>
  );
};

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Auth state
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Local state
  const [selectedAddressId, setSelectedAddressId] = useState(searchParams.get('address') || '');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
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
  const { data: cartData, isLoading: loadingCart } = useCartAvailability();
  const { data: addresses, isLoading: loadingAddresses } = useAddresses();
  const initiateOrder = useInitiateOrder();
  const confirmOrder = useConfirmOrder();
  const placeOrderCOD = usePlaceOrderCOD();

  // Calculate totals from cart availability
  const { total, itemCount } = useMemo(() => {
    if (!cartData) {
      return { total: 0, itemCount: 0 };
    }
    return {
      total: cartData.total_amount,
      itemCount: cartData.total_quantity,
    };
  }, [cartData]);

  // Set default address
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const firstAddress = addresses[0];
      if (firstAddress._id) {
        setSelectedAddressId(firstAddress._id);
      }
    }
  }, [addresses, selectedAddressId]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Handle Razorpay payment
  const handleRazorpayPayment = useCallback(async () => {
    if (!selectedAddressId) {
      setSnackbar({ open: true, message: 'Please select a delivery address', severity: 'error' });
      return;
    }

    setIsProcessing(true);

    try {
      // Initiate order to get Razorpay order
      const razorpayOrder = await initiateOrder.mutateAsync(selectedAddressId);

      const options: RazorpayOptions = {
        key: razorpayOrder.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_key',
        amount: razorpayOrder.amount_in_paise, // Amount in paise (already converted by backend)
        currency: 'INR',
        name: 'True Style',
        description: 'Fashion Order',
        order_id: razorpayOrder.razorpay_order_id,
        handler: async (response: RazorpayResponse) => {
          try {
            const paymentData: RazorpayPaymentData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };

            await confirmOrder.mutateAsync({
              addressId: selectedAddressId,
              paymentData: paymentData,
            });

            navigate('/order-success');
          } catch {
            setSnackbar({
              open: true,
              message: 'Payment verification failed. Please contact support.',
              severity: 'error',
            });
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.email?.split('@')[0] || 'Guest',
          email: user?.email || '',
          contact: addresses?.find(a => a._id === selectedAddressId)?.mobile_no || '',
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch {
      setSnackbar({
        open: true,
        message: 'Failed to initiate payment. Please try again.',
        severity: 'error',
      });
      setIsProcessing(false);
    }
  }, [selectedAddressId, initiateOrder, confirmOrder, navigate, user, addresses]);

  // Handle COD order
  const handleCODOrder = useCallback(async () => {
    if (!selectedAddressId) {
      setSnackbar({ open: true, message: 'Please select a delivery address', severity: 'error' });
      return;
    }

    setIsProcessing(true);

    try {
      await placeOrderCOD.mutateAsync(selectedAddressId);
      navigate('/order-success');
    } catch {
      setSnackbar({
        open: true,
        message: 'Failed to place order. Please try again.',
        severity: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedAddressId, placeOrderCOD, navigate]);

  // Handle place order
  const handlePlaceOrder = useCallback(() => {
    if (paymentMethod === 'razorpay') {
      handleRazorpayPayment();
    } else {
      handleCODOrder();
    }
  }, [paymentMethod, handleRazorpayPayment, handleCODOrder]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Please login to checkout
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

  if (loadingCart || loadingAddresses) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" width={200} height={40} />
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Empty cart
  if (!cartData || cartData.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9f9f9' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 500, mb: 3 }}>
          Checkout
        </Typography>

        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Delivery Address */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 0 }}>
              <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                Delivery Address
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {addresses?.map((address) => (
                  <Grid key={address._id} size={{ xs: 12, sm: 6 }}>
                    <AddressCard
                      address={address}
                      selected={selectedAddressId === address._id}
                      onSelect={() => address._id && setSelectedAddressId(address._id)}
                    />
                  </Grid>
                ))}
              </Grid>

              <Button
                variant="text"
                onClick={() => navigate('/addresses?redirect=checkout')}
                sx={{ mt: 2, textTransform: 'none' }}
              >
                + Add New Address
              </Button>
            </Paper>

            {/* Payment Method */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 0 }}>
              <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                Payment Method
              </Typography>

              <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }}>
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as 'razorpay' | 'cod')}
                >
                  <Paper
                    elevation={0}
                    onClick={() => setPaymentMethod('razorpay')}
                    sx={{
                      p: 2,
                      mb: 2,
                      border: paymentMethod === 'razorpay' ? '2px solid #000' : '1px solid #ddd',
                      borderRadius: 0,
                      cursor: 'pointer',
                    }}
                  >
                    <FormControlLabel
                      value="razorpay"
                      control={<Radio sx={{ p: 0, mr: 1 }} />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CreditCard />
                          <Box>
                            <Typography variant="body1">Pay Online</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Credit/Debit Card, UPI, Netbanking, Wallets
                            </Typography>
                          </Box>
                        </Box>
                      }
                      sx={{ m: 0 }}
                    />
                  </Paper>

                  <Paper
                    elevation={0}
                    onClick={() => setPaymentMethod('cod')}
                    sx={{
                      p: 2,
                      border: paymentMethod === 'cod' ? '2px solid #000' : '1px solid #ddd',
                      borderRadius: 0,
                      cursor: 'pointer',
                    }}
                  >
                    <FormControlLabel
                      value="cod"
                      control={<Radio sx={{ p: 0, mr: 1 }} />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocalAtm />
                          <Box>
                            <Typography variant="body1">Cash on Delivery</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Pay when your order arrives
                            </Typography>
                          </Box>
                        </Box>
                      }
                      sx={{ m: 0 }}
                    />
                  </Paper>
                </RadioGroup>
              </FormControl>
            </Paper>
          </Grid>

          {/* Right Column - Order Summary */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 0, position: 'sticky', top: 80 }}>
              <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                Order Summary ({itemCount} items)
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Order Items */}
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {cartData?.items?.map((item) => (
                  <OrderItemRow key={item.cart_item_id} item={item} />
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Price Breakdown */}
              <Box sx={{ '& > div': { display: 'flex', justifyContent: 'space-between', mb: 1 } }}>
                <Box>
                  <Typography variant="body2">Total ({itemCount} items)</Typography>
                  <Typography variant="body2">₹{total.toLocaleString('en-IN')}</Typography>
                </Box>
                <Box>
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

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handlePlaceOrder}
                disabled={isProcessing || !selectedAddressId}
                startIcon={
                  isProcessing ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <CheckCircle />
                  )
                }
                sx={{
                  backgroundColor: '#000',
                  '&:hover': { backgroundColor: '#333' },
                  py: 1.5,
                  borderRadius: 0,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                {isProcessing
                  ? 'Processing...'
                  : paymentMethod === 'cod'
                  ? 'Place Order'
                  : 'Pay Now'}
              </Button>

              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                textAlign="center"
                sx={{ mt: 2 }}
              >
                By placing your order, you agree to our Terms of Service
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

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
