import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import {
  CheckCircleOutline,
  ShoppingBagOutlined,
} from '@mui/icons-material';

export const OrderSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  // Clear any cart state if needed
  useEffect(() => {
    // Could invalidate cart query here if needed
  }, []);

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f9f9f9',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 0,
          }}
        >
          <CheckCircleOutline
            sx={{
              fontSize: 80,
              color: 'success.main',
              mb: 3,
            }}
          />

          <Typography variant="h4" gutterBottom sx={{ fontWeight: 500 }}>
            Order Placed Successfully!
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 4 }}>
            Thank you for shopping with us. Your order has been confirmed and will be delivered soon.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={() => navigate('/orders')}
              sx={{
                backgroundColor: '#000',
                '&:hover': { backgroundColor: '#333' },
                borderRadius: 0,
                px: 4,
                py: 1.5,
              }}
            >
              View Orders
            </Button>

            <Button
              variant="outlined"
              startIcon={<ShoppingBagOutlined />}
              onClick={() => navigate('/products')}
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
        </Paper>
      </Container>
    </Box>
  );
};
