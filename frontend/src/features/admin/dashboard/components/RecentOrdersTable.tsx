import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
} from '@mui/material';
import { useRecentOrders } from '../hooks/useDashboard';

const statusColor = (status: string | null): 'default' | 'warning' | 'success' | 'error' | 'info' => {
  if (!status) return 'default';
  const s = status.toLowerCase();
  if (s.includes('deliver') || s.includes('complet')) return 'success';
  if (s.includes('pend') || s.includes('process')) return 'warning';
  if (s.includes('cancel') || s.includes('fail')) return 'error';
  if (s.includes('ship')) return 'info';
  return 'default';
};

export const RecentOrdersTable: React.FC = () => {
  const { data, isLoading } = useRecentOrders({ limit: 10 });

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>
          Recent Orders
        </Typography>
        {data && (
          <Chip label={`Total: ${data.total_count}`} size="small" color="primary" variant="outlined" />
        )}
      </Box>

      {isLoading ? (
        <Box>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} height={48} sx={{ mb: 0.5 }} />
          ))}
        </Box>
      ) : (
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Payment</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.orders ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary" py={2}>No recent orders</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data?.orders.map((order) => (
                  <TableRow key={order.order_id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                      {order.order_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>₹{order.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.status ?? 'N/A'}
                        size="small"
                        color={statusColor(order.status)}
                      />
                    </TableCell>
                    <TableCell>{order.payment_method ?? 'N/A'}</TableCell>
                    <TableCell>
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};
