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
  Replay,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../app/store';
import { useMyReturnsEnriched } from '../hooks/useReturns';
import { ROUTES } from '../../../../config/constants';
import type { ReturnEnriched } from '../types';

// Return status colors
const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info' => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('approved') || statusLower.includes('completed') || statusLower.includes('refunded')) return 'success';
  if (statusLower.includes('rejected') || statusLower.includes('cancelled')) return 'error';
  if (statusLower.includes('pending') || statusLower.includes('processing')) return 'warning';
  return 'default';
};

// Return Card Component
const ReturnCard: React.FC<{ returnItem: ReturnEnriched }> = ({ returnItem }) => {
  const createdDate = new Date(returnItem.createdAt).toLocaleDateString('en-IN', {
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
            Return #{returnItem._id.slice(-8).toUpperCase()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Requested on {createdDate}
          </Typography>
        </Box>
        <Chip
          label={returnItem.return_status || 'Processing'}
          size="small"
          color={getStatusColor(returnItem.return_status || '')}
          sx={{ borderRadius: 1 }}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2}>
        {/* Product Image and Details */}
        <Grid size={{ xs: 12, sm: 3 }}>
          <Box
            component="img"
            src={returnItem.thumbnail_url || '/placeholder.jpg'}
            alt={returnItem.product_name}
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
            {returnItem.product_name}
          </Typography>
          
          {returnItem.brand_name && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Brand: {returnItem.brand_name}
            </Typography>
          )}
          
          {returnItem.size && (
            <Typography variant="body2" color="text.secondary">
              Size: {returnItem.size}
            </Typography>
          )}
          
          <Typography variant="body2" sx={{ mt: 1 }}>
            Quantity: {returnItem.quantity}
          </Typography>

          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            ₹{returnItem.price.toLocaleString('en-IN')}
          </Typography>

          {returnItem.reason && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              Reason: {returnItem.reason}
            </Typography>
          )}
        </Grid>
      </Grid>

      {returnItem.amount && returnItem.amount > 0 && (
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
            Refund Amount: ₹{returnItem.amount.toLocaleString('en-IN')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export const ReturnsPage: React.FC = () => {
  const navigate = useNavigate();

  // Auth state
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Fetch enriched returns with product data
  const { data: returns, isLoading } = useMyReturnsEnriched();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Replay sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Please login to view your returns
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

  // Empty returns
  if (!returns || returns.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Replay sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No returns yet
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          You haven't initiated any return requests
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
          My Returns
        </Typography>

        {returns?.map((returnItem: ReturnEnriched) => (
          <ReturnCard key={returnItem._id} returnItem={returnItem} />
        ))}

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Need to return more items? Go to your{' '}
            <Button
              variant="text"
              onClick={() => navigate('/orders')}
              sx={{ textTransform: 'none', p: 0, minWidth: 0 }}
            >
              orders
            </Button>{' '}
            to initiate a return.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
