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
  Grid,
} from '@mui/material';
import {
  SwapHoriz,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../app/store';
import { useMyExchangesEnriched } from '../hooks/useExchanges';
import { ROUTES } from '../../../../config/constants';
import type { ExchangeEnriched } from '../types';

// Exchange status colors
const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info' => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('approved') || statusLower.includes('completed') || statusLower.includes('delivered')) return 'success';
  if (statusLower.includes('rejected') || statusLower.includes('cancelled')) return 'error';
  if (statusLower.includes('pending') || statusLower.includes('processing')) return 'warning';
  if (statusLower.includes('shipped') || statusLower.includes('transit')) return 'info';
  return 'default';
};

// Exchange Card Component
const ExchangeCard: React.FC<{ exchange: ExchangeEnriched }> = ({ exchange }) => {
  const createdDate = new Date(exchange.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 2,
        borderRadius: 0,
        border: '1px solid #eee',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Exchange #{exchange._id.slice(-8).toUpperCase()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Requested on {createdDate}
          </Typography>
        </Box>
        <Chip
          label={exchange.exchange_status || 'Processing'}
          size="small"
          color={getStatusColor(exchange.exchange_status || '')}
          sx={{ borderRadius: 1 }}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2}>
        {/* Product Image and Details */}
        <Grid size={{ xs: 12, sm: 3 }}>
          <Box
            component="img"
            src={exchange.thumbnail_url || '/placeholder.jpg'}
            alt={exchange.product_name}
            sx={{
              width: '100%',
              height: 'auto',
              aspectRatio: '1',
              objectFit: 'cover',
              border: '1px solid #eee',
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 9 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
            {exchange.product_name}
          </Typography>
          
          {exchange.brand_name && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Brand: {exchange.brand_name}
            </Typography>
          )}

          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            ₹{exchange.price.toLocaleString('en-IN')}
          </Typography>
          
          {exchange.original_size && exchange.new_size && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                Size: {exchange.original_size}
              </Typography>
              <SwapHoriz sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="primary.main" fontWeight={500}>
                {exchange.new_size}
              </Typography>
            </Box>
          )}

          {exchange.new_quantity && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Quantity: {exchange.new_quantity}
            </Typography>
          )}

          {exchange.reason && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              Reason: {exchange.reason}
            </Typography>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export const ExchangesPage: React.FC = () => {
  const navigate = useNavigate();

  // Auth state
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Fetch enriched exchanges with product data
  const { data: exchanges, isLoading } = useMyExchangesEnriched();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <SwapHoriz sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Please login to view your exchanges
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
        {[...Array(2)].map((_, index) => (
          <Skeleton key={index} variant="rectangular" height={180} sx={{ mb: 2 }} />
        ))}
      </Container>
    );
  }

  // Empty exchanges
  if (!exchanges || exchanges.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <SwapHoriz sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No exchanges yet
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          You haven't initiated any exchange requests
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/orders')}
          sx={{ backgroundColor: '#000' }}
        >
          View Orders
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9f9f9' }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 500, mb: 3 }}>
          My Exchanges
        </Typography>

        {exchanges?.map((exchange: ExchangeEnriched) => (
          <ExchangeCard key={exchange._id} exchange={exchange} />
        ))}

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Need to exchange more items? Go to your{' '}
            <Button
              variant="text"
              onClick={() => navigate('/orders')}
              sx={{ textTransform: 'none', p: 0, minWidth: 0 }}
            >
              orders
            </Button>{' '}
            to initiate an exchange.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
