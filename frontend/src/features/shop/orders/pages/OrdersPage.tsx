import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Chip,
  Skeleton,
  Divider,
} from '@mui/material';
import {
  ShoppingBagOutlined,
  ChevronRight,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../app/store';
import { useMyOrders } from '../hooks/useOrders';
import { ROUTES } from '../../../../config/constants';
import type { Order } from '../types';

// Order status colors
const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info' => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('delivered')) return 'success';
  if (statusLower.includes('cancelled')) return 'error';
  if (statusLower.includes('pending') || statusLower.includes('processing')) return 'warning';
  if (statusLower.includes('shipped') || statusLower.includes('transit')) return 'info';
  return 'default';
};

// Order Card Component
const OrderCard: React.FC<{ order: Order; onClick: () => void }> = ({ order, onClick }) => {
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 3,
        mb: 2,
        borderRadius: 0,
        cursor: 'pointer',
        border: '1px solid #eee',
        '&:hover': {
          borderColor: '#ddd',
          backgroundColor: '#fafafa',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Order #{order._id.slice(-8).toUpperCase()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Placed on {orderDate}
          </Typography>
        </Box>
        <Chip
          label={order.status || 'Processing'}
          size="small"
          color={getStatusColor(order.status || '')}
          sx={{ borderRadius: 1 }}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Order Details */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Order Total
          </Typography>
          <Typography variant="h6" fontWeight={500}>
            ₹{order.total.toLocaleString('en-IN')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            View Details
          </Typography>
          <ChevronRight />
        </Box>
      </Box>
    </Paper>
  );
};

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();

  // Auth state
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Fetch orders
  const { data: orders, isLoading } = useMyOrders();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <ShoppingBagOutlined sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Please login to view your orders
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
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} variant="rectangular" height={150} sx={{ mb: 2 }} />
        ))}
      </Container>
    );
  }

  // Empty orders
  if (!orders || orders.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <ShoppingBagOutlined sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No orders yet
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Start shopping to see your orders here
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/products')}
          sx={{ backgroundColor: '#000' }}
        >
          Start Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9f9f9' }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 500, mb: 3 }}>
          My Orders
        </Typography>

        {orders.map((order) => (
          <OrderCard
            key={order._id}
            order={order}
            onClick={() => navigate(`/orders/${order._id}`)}
          />
        ))}
      </Container>
    </Box>
  );
};
