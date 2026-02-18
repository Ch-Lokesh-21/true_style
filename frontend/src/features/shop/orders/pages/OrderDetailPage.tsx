import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Paper,
  Chip,
  Divider,
  Skeleton,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  LocalShipping,
  SwapHoriz,
  Replay,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../app/store';
import { useMyOrder, useOrderItemsEnriched } from '../hooks/useOrders';
import { useCreateReturn } from '../../returns/hooks/useReturns';
import { useCreateExchange } from '../../exchanges/hooks/useExchanges';
import type { OrderItemEnriched } from '../types';

// Order status steps
const ORDER_STEPS = ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

const getActiveStep = (status: string): number => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('delivered')) return 4;
  if (statusLower.includes('out for delivery')) return 3;
  if (statusLower.includes('shipped') || statusLower.includes('transit')) return 2;
  if (statusLower.includes('processing') || statusLower.includes('confirmed')) return 1;
  return 0;
};

// Return/Exchange Dialog
const ActionDialog: React.FC<{
  open: boolean;
  type: 'return' | 'exchange';
  item: OrderItemEnriched | null;
  onClose: () => void;
  onSubmit: (data: { quantity: number; reason?: string; new_size?: string }) => void;
}> = ({ open, type, item, onClose, onSubmit }) => {
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [newSize, setNewSize] = useState('');

  const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleSubmit = () => {
    if (!quantity || quantity < 1) return;
    onSubmit({
      quantity,
      reason: reason || undefined,
      new_size: type === 'exchange' ? newSize : undefined,
    });
    setQuantity(1);
    setReason('');
    setNewSize('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {type === 'return' ? 'Return Item' : 'Exchange Item'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {item?.product_name}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FormControl fullWidth>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Quantity *
            </Typography>
            <TextField
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              inputProps={{ min: 1, max: item?.quantity || 1 }}
              size="small"
              fullWidth
            />
          </FormControl>
          <FormControl fullWidth>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Reason (Optional)
            </Typography>
            <TextField
              multiline
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for return/exchange..."
              size="small"
            />
          </FormControl>

          {type === 'exchange' && (
            <FormControl fullWidth>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Select New Size
              </Typography>
              <Select
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                size="small"
                displayEmpty
              >
                <MenuItem value="">
                  Same size
                </MenuItem>
                {SIZES.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!quantity || quantity < 1}
          sx={{ backgroundColor: '#000' }}
        >
          Submit {type === 'return' ? 'Return' : 'Exchange'} Request
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Order Item Component
const OrderItemCard: React.FC<{
  item: OrderItemEnriched;
  canReturn: boolean;
  canExchange: boolean;
  onReturn: () => void;
  onExchange: () => void;
}> = ({ item, canReturn, canExchange, onReturn, onExchange }) => {
  return (
    <Box sx={{ py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Grid container spacing={2}>
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

        <Grid size={{ xs: 9, sm: 10 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {item.brand_name}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                {item.product_name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Size: {item.size}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Qty: {item.quantity}
                </Typography>
              </Box>
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </Typography>

              {/* Item Status */}
              {item.item_status && (
                <Chip
                  label={item.item_status.replace(/_/g, ' ').toUpperCase()}
                  size="small"
                  sx={{ mt: 1, borderRadius: 1 }}
                />
              )}
            </Box>

            {/* Action Buttons */}
            {(canReturn || canExchange) && (
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                {canReturn && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Replay />}
                    onClick={onReturn}
                    sx={{
                      borderRadius: 0,
                      borderColor: '#ddd',
                      color: '#000',
                      textTransform: 'none',
                    }}
                  >
                    Return
                  </Button>
                )}
                {canExchange && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<SwapHoriz />}
                    onClick={onExchange}
                    sx={{
                      borderRadius: 0,
                      borderColor: '#ddd',
                      color: '#000',
                      textTransform: 'none',
                    }}
                  >
                    Exchange
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Auth state
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Local state
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'return' | 'exchange';
    item: OrderItemEnriched | null;
  }>({
    open: false,
    type: 'return',
    item: null,
  });
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
  const { data: order, isLoading: loadingOrder } = useMyOrder(id || '');
  const { data: orderItems, isLoading: loadingItems } = useOrderItemsEnriched(id || '');
  const createReturn = useCreateReturn();
  const createExchange = useCreateExchange();

  // Check if items can be returned/exchanged (within 7 days of delivery)
  const canReturnExchange = useCallback((deliveryDate: string) => {
    if (!deliveryDate) return false;
    const delivered = new Date(deliveryDate);
    const daysSinceDelivery = Math.floor(
      (Date.now() - delivered.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceDelivery <= 7;
  }, []);

  // Handlers
  const handleOpenReturn = useCallback((item: OrderItemEnriched) => {
    setActionDialog({ open: true, type: 'return', item });
  }, []);

  const handleOpenExchange = useCallback((item: OrderItemEnriched) => {
    setActionDialog({ open: true, type: 'exchange', item });
  }, []);

  const handleSubmitAction = useCallback(
    (data: { quantity: number; reason?: string; new_size?: string }) => {
      if (!actionDialog.item) return;

      if (actionDialog.type === 'return') {
        const payload = {
          order_item_id: actionDialog.item._id,
          quantity: data.quantity,
          reason: data.reason,
        };
        createReturn.mutate(payload, {
          onSuccess: () => {
            setSnackbar({
              open: true,
              message: 'Return request submitted successfully',
              severity: 'success',
            });
          },
          onError: () => {
            setSnackbar({
              open: true,
              message: 'Failed to submit return request',
              severity: 'error',
            });
          },
        });
      } else {
        const payload = {
          order_item_id: actionDialog.item._id,
          new_quantity: data.quantity,
          new_size: data.new_size,
          reason: data.reason,
        };
        createExchange.mutate(
          payload,
          {
            onSuccess: () => {
              setSnackbar({
                open: true,
                message: 'Exchange request submitted successfully',
                severity: 'success',
              });
            },
            onError: () => {
              setSnackbar({
                open: true,
                message: 'Failed to submit exchange request',
                severity: 'error',
              });
            },
          }
        );
      }
    },
    [actionDialog, createReturn, createExchange]
  );

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Please login to view order details
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/login')}
          sx={{ mt: 2, backgroundColor: '#000' }}
        >
          Login
        </Button>
      </Container>
    );
  }

  if (loadingOrder || loadingItems) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Skeleton variant="text" width={100} height={40} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={100} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={200} />
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Order not found
        </Typography>
        <Button onClick={() => navigate('/orders')} sx={{ mt: 2 }}>
          Back to Orders
        </Button>
      </Container>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const activeStep = getActiveStep(order.status || '');
  
  // Show return/exchange only if order is delivered AND within 7 days
  const isDelivered = order.status?.toLowerCase().includes('delivered') || false;
  const showReturnExchange = isDelivered && canReturnExchange(order.delivery_date);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9f9f9' }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/orders')}
          sx={{ mb: 3, textTransform: 'none' }}
        >
          Back to Orders
        </Button>

        {/* Order Header */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h6" fontWeight={500}>
                Order #{order._id.slice(-8).toUpperCase()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Placed on {orderDate}
              </Typography>
            </Box>
            <Typography variant="h6" fontWeight={500}>
              ₹{order.total.toLocaleString('en-IN')}
            </Typography>
          </Box>

          {/* Order Progress */}
          <Box sx={{ mt: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {ORDER_STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        </Paper>

        {/* Delivery Address */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LocalShipping />
            <Typography variant="subtitle1" fontWeight={500}>
              Delivery Address
            </Typography>
          </Box>
          <Typography variant="body2">
            {order.address.address}
          </Typography>
          <Typography variant="body2">
            {order.address.city}, {order.address.state} - {order.address.postal_code}
          </Typography>
          <Typography variant="body2">
            Mobile: {order.address.mobile_no}
          </Typography>
        </Paper>

        {/* Order Items */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 0 }}>
          <Typography variant="subtitle1" fontWeight={500} gutterBottom>
            Order Items ({orderItems?.length || 0})
          </Typography>

          <Divider sx={{ my: 2 }} />

          {orderItems?.map((item: OrderItemEnriched) => (
            <OrderItemCard
              key={item._id}
              item={item}
              canReturn={showReturnExchange}
              canExchange={showReturnExchange}
              onReturn={() => handleOpenReturn(item)}
              onExchange={() => handleOpenExchange(item)}
            />
          ))}

          {/* Price Summary */}
          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Order Total</Typography>
              <Typography variant="body2">₹{order.total.toLocaleString('en-IN')}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Delivery</Typography>
              <Typography variant="body2" color="success.main">
                Free
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" fontWeight={500}>
                Total
              </Typography>
              <Typography variant="subtitle1" fontWeight={500}>
                ₹{order.total.toLocaleString('en-IN')}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Return/Exchange Info */}
        {showReturnExchange && (
          <Paper elevation={0} sx={{ p: 3, mt: 3, borderRadius: 0, bgcolor: '#fff9e6' }}>
            <Box component="div" sx={{ display: 'block' }}>
              <strong>Easy Returns & Exchanges:</strong>{' '}
              <Typography variant="body2" component="span">
                You can return or exchange delivered items within 7 days of delivery.
              </Typography>
            </Box>
          </Paper>
        )}
      </Container>

      {/* Return/Exchange Dialog */}
      <ActionDialog
        open={actionDialog.open}
        type={actionDialog.type}
        item={actionDialog.item}
        onClose={() => setActionDialog((prev) => ({ ...prev, open: false }))}
        onSubmit={handleSubmitAction}
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
