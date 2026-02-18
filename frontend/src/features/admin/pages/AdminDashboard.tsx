import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import {
  Inventory as ProductIcon,
  ShoppingCart as OrderIcon,
  RateReview as ReviewIcon,
  Star as RatingIcon,
} from '@mui/icons-material';

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Paper sx={{ p: 3 }}>
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight="bold">
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          backgroundColor: color,
          borderRadius: 2,
          p: 2,
          color: 'white',
        }}
      >
        {icon}
      </Box>
    </Box>
  </Paper>
);

export const AdminDashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Welcome to the Admin Dashboard
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <StatCard
            title="Total Products"
            value="0"
            icon={<ProductIcon />}
            color="#1976d2"
          />
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <StatCard
            title="Total Orders"
            value="0"
            icon={<OrderIcon />}
            color="#2e7d32"
          />
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <StatCard
            title="Total Reviews"
            value="0"
            icon={<ReviewIcon />}
            color="#ed6c02"
          />
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <StatCard
            title="Average Rating"
            value="0.0"
            icon={<RatingIcon />}
            color="#9c27b0"
          />
        </Box>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 300px' }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Orders
              </Typography>
              <Typography color="text.secondary">
                View and manage recent orders from customers
              </Typography>
            </Paper>
          </Box>
          <Box sx={{ flex: '1 1 300px' }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Pending Reviews
              </Typography>
              <Typography color="text.secondary">
                Review and approve customer feedback
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
