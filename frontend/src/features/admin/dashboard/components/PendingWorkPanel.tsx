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
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import { usePendingWork } from '../hooks/useDashboard';

export const PendingWorkPanel: React.FC = () => {
  const [tab, setTab] = React.useState(0);
  const { data, isLoading } = usePendingWork({ limit: 10 });

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h6" fontWeight={600} mb={2}>
        Pending Work
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab
          label={
            <Badge badgeContent={data?.pending_orders_count ?? 0} color="warning" max={99}>
              <Box pr={2}>Orders</Box>
            </Badge>
          }
        />
        <Tab
          label={
            <Badge badgeContent={data?.pending_returns_count ?? 0} color="error" max={99}>
              <Box pr={2}>Returns</Box>
            </Badge>
          }
        />
        <Tab
          label={
            <Badge badgeContent={data?.pending_exchanges_count ?? 0} color="info" max={99}>
              <Box pr={2}>Exchanges</Box>
            </Badge>
          }
        />
      </Tabs>

      {isLoading ? (
        <Box>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} height={42} sx={{ mb: 0.5 }} />
          ))}
        </Box>
      ) : (
        <TableContainer sx={{ maxHeight: 350 }}>
          {tab === 0 && (
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.pending_orders ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary" py={2}>No pending orders</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.pending_orders.map((o) => (
                    <TableRow key={o.order_id} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                        {o.order_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>₹{o.total.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip label={o.status ?? 'Pending'} size="small" color="warning" />
                      </TableCell>
                      <TableCell>
                        {o.created_at ? new Date(o.created_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {tab === 1 && (
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Return ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.pending_returns ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary" py={2}>No pending returns</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.pending_returns.map((r) => (
                    <TableRow key={r.return_id} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                        {r.return_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                        {r.order_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>{r.reason ?? 'N/A'}</TableCell>
                      <TableCell>
                        <Chip label={r.return_status ?? 'Pending'} size="small" color="error" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {tab === 2 && (
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Exchange ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.pending_exchanges ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary" py={2}>No pending exchanges</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.pending_exchanges.map((e) => (
                    <TableRow key={e.exchange_id} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                        {e.exchange_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                        {e.order_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>{e.reason ?? 'N/A'}</TableCell>
                      <TableCell>
                        <Chip label={e.exchange_status ?? 'Pending'} size="small" color="info" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      )}
    </Paper>
  );
};
