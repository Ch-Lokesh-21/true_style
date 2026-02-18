import React from 'react';
import { Paper, Box, Typography, Skeleton } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, loading }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider',
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: 4 },
    }}
  >
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        {loading ? (
          <Skeleton width={80} height={40} />
        ) : (
          <Typography variant="h4" fontWeight="bold">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          backgroundColor: color,
          borderRadius: 2,
          p: 1.5,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
    </Box>
  </Paper>
);
