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
  LinearProgress,
  Chip,
} from '@mui/material';
import { EmojiEvents as TrophyIcon } from '@mui/icons-material';
import { useTopProducts } from '../hooks/useDashboard';

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

export const TopProductsTable: React.FC = () => {
  const { data, isLoading } = useTopProducts({ limit: 10 });

  const maxRevenue = React.useMemo(() => {
    if (!data?.items?.length) return 1;
    return Math.max(...data.items.map((p) => p.total_revenue));
  }, [data]);

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <TrophyIcon sx={{ color: '#FFD700' }} />
        <Typography variant="h6" fontWeight={600}>
          Top Products
        </Typography>
      </Box>

      {isLoading ? (
        <Box>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} height={48} sx={{ mb: 0.5 }} />
          ))}
        </Box>
      ) : (
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }} width={50}>#</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Qty Sold</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Orders</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Revenue</TableCell>
                <TableCell sx={{ fontWeight: 600 }} width={120}>Share</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.items ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary" py={2}>No product data</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((product, index) => (
                  <TableRow key={product.product_id} hover>
                    <TableCell>
                      {index < 3 ? (
                        <Chip
                          label={index + 1}
                          size="small"
                          sx={{
                            bgcolor: MEDAL_COLORS[index],
                            color: index === 0 ? '#000' : '#fff',
                            fontWeight: 700,
                            minWidth: 32,
                          }}
                        />
                      ) : (
                        <Typography variant="body2" fontWeight={600} pl={1}>
                          {index + 1}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={index < 3 ? 600 : 400}>
                        {product.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{product.total_quantity.toLocaleString()}</TableCell>
                    <TableCell align="right">{product.total_orders.toLocaleString()}</TableCell>
                    <TableCell align="right">₹{product.total_revenue.toLocaleString()}</TableCell>
                    <TableCell>
                      <LinearProgress
                        variant="determinate"
                        value={(product.total_revenue / maxRevenue) * 100}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            bgcolor: index < 3 ? '#1976d2' : '#90caf9',
                          },
                        }}
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
