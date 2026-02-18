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
  Skeleton,
  Chip,
  LinearProgress,
} from '@mui/material';
import { WarningAmber as WarningIcon } from '@mui/icons-material';
import { useLowStock } from '../hooks/useDashboard';

export const LowStockTable: React.FC = () => {
  const { data, isLoading } = useLowStock({ threshold: 10 });

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <WarningIcon sx={{ color: '#ed6c02' }} />
        <Typography variant="h6" fontWeight={600}>
          Low Stock Alerts
        </Typography>
        {data && (
          <Chip
            label={`${data.items.length} items`}
            size="small"
            color={data.items.length > 0 ? 'warning' : 'success'}
            variant="outlined"
          />
        )}
      </Box>

      {isLoading ? (
        <Box>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} height={42} sx={{ mb: 0.5 }} />
          ))}
        </Box>
      ) : (
        <TableContainer sx={{ maxHeight: 350 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Remaining</TableCell>
                <TableCell sx={{ fontWeight: 600 }} width={120}>Level</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.items ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography color="success.main" py={2} fontWeight={500}>
                      All products are well stocked!
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((item) => (
                  <TableRow key={item.product_id} hover>
                    <TableCell>
                      <Typography variant="body2">{item.name}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={item.quantity}
                        size="small"
                        color={item.quantity === 0 ? 'error' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((item.quantity / (data?.threshold ?? 10)) * 100, 100)}
                        color={item.quantity === 0 ? 'error' : 'warning'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
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
