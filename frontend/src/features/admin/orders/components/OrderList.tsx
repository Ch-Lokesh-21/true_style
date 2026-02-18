import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridSlots,
} from '@mui/x-data-grid';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import {
  useOrders,
  useUpdateOrder,
  useDeleteOrder,
  useOrderStatuses,
} from '../hooks/useOrders';
import { OrderFormModal } from './OrderFormModal';
import type { Order, OrderStatus } from '../types';

interface CustomToolbarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  paymentFilter: string;
  setPaymentFilter: (value: string) => void;
  statuses?: OrderStatus[];
}

// Custom Toolbar with Search and Filters
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const CustomToolbar: React.FC<CustomToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  paymentFilter,
  setPaymentFilter,
  statuses,
}) => {
  return (
    <Box sx={{ p: 2, width: '100%' }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          fullWidth
          placeholder="Search by order ID or user..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {statuses?.map((status) => (
              <MenuItem key={status._id} value={status._id}>
                {status.status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Payment Method</InputLabel>
          <Select
            value={paymentFilter}
            label="Payment Method"
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="cod">COD</MenuItem>
            <MenuItem value="razorpay">Razorpay</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          onClick={() => {
            setSearchQuery('');
            setStatusFilter('');
            setPaymentFilter('');
          }}
        >
          Clear Filters
        </Button>
        <Box sx={{ flexGrow: 1 }} />
      </Box>
    </Box>
  );
};

interface ViewModalProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  statuses?: OrderStatus[];
}

// View Modal Component
const ViewModal: React.FC<ViewModalProps> = ({ open, order, onClose, statuses }) => {
  if (!order) return null;

  const status = statuses?.find((s) => s._id === order.status_id);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Order Details</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6" gutterBottom>
            Order #{order._id}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2">
              <strong>Total:</strong> ₹{order.total}
            </Typography>
            <Typography variant="body2">
              <strong>Status:</strong>{' '}
              <Chip label={status?.status || 'N/A'} color="primary" size="small" />
            </Typography>
            <Typography variant="body2">
              <strong>Payment Method:</strong> {order.payment_method.toUpperCase()}
            </Typography>
            {order.razorpay_payment_id && (
              <Typography variant="body2">
                <strong>Payment ID:</strong> {order.razorpay_payment_id}
              </Typography>
            )}
            <Typography variant="body2">
              <strong>Delivery Date:</strong>{' '}
              {new Date(order.delivery_date).toLocaleDateString()}
            </Typography>
            {order.delivery_otp && (
              <Typography variant="body2">
                <strong>Delivery OTP:</strong> {order.delivery_otp}
              </Typography>
            )}
            <Typography variant="body2">
              <strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Shipping Address:</strong>
            </Typography>
            <Typography variant="body2">{order.address.address}</Typography>
            <Typography variant="body2">
              {order.address.city}, {order.address.state} - {order.address.postal_code}
            </Typography>
            <Typography variant="body2">{order.address.country}</Typography>
            <Typography variant="body2">
              <strong>Mobile:</strong> {order.address.mobile_no}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

interface DeleteModalProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

// Delete Modal Component
const DeleteModal: React.FC<DeleteModalProps> = ({
  open,
  order,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete order "#{order?._id}"? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" disabled={isDeleting}>
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const OrderList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: 'view' | 'edit' | 'delete';
    order: Order | null;
  }>({
    open: false,
    mode: 'view',
    order: null,
  });

  const { data: statuses } = useOrderStatuses();
  const {
    data: orders,
    isLoading,
    refetch,
  } = useOrders({
    status_id: statusFilter || undefined,
    payment_method: (paymentFilter as 'cod' | 'razorpay' | undefined) || undefined,
  });

  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();

  useEffect(() => {
    refetch();
  }, [statusFilter, paymentFilter, refetch]);

  const closeModal = () => {
    setModalState({ open: false, mode: 'view', order: null });
  };

  const handleView = (order: Order) => {
    setModalState({ open: true, mode: 'view', order });
  };

  const handleEdit = (order: Order) => {
    setModalState({ open: true, mode: 'edit', order });
  };

  const handleDelete = (order: Order) => {
    setModalState({ open: true, mode: 'delete', order });
  };

  const handleConfirmDelete = () => {
    if (modalState.order) {
      deleteOrder.mutate(modalState.order._id, {
        onSuccess: closeModal,
      });
    }
  };

  const handleSubmit = (data: { delivery_date?: string; order_status_id?: string }) => {
    if (modalState.mode === 'edit' && modalState.order) {
      updateOrder.mutate(
        {
          id: modalState.order._id,
          data: {
            delivery_date: data.delivery_date,
            status_id: data.order_status_id,
          },
        },
        {
          onSuccess: closeModal,
        }
      );
    }
  };

  const filteredOrders = orders?.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order._id.toLowerCase().includes(query) ||
      order.user_id.toLowerCase().includes(query) ||
      order.payment_method.toLowerCase().includes(query)
    );
  });

  const columns: GridColDef[] = [
    {
      field: '_id',
      headerName: 'Order ID',
      width: 220,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.value.slice(0, 8)}...
        </Typography>
      ),
    },
    {
      field: 'user_id',
      headerName: 'User ID',
      width: 220,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.value.slice(0, 8)}...
        </Typography>
      ),
    },
    {
      field: 'total',
      headerName: 'Total',
      width: 120,
      valueFormatter: (value) => `₹${value}`,
    },
    {
      field: 'status_id',
      headerName: 'Status',
      width: 150,
      valueGetter: (_value, row) => {
        const status = statuses?.find((s) => s._id === row.status_id);
        return status?.status || 'N/A';
      },
      renderCell: (params) => (
        <Chip label={params.value} color="primary" size="small" />
      ),
    },
    {
      field: 'payment_method',
      headerName: 'Payment',
      width: 120,
      valueFormatter: (value) => (value as string).toUpperCase(),
    },
    {
      field: 'delivery_date',
      headerName: 'Delivery Date',
      width: 150,
      valueFormatter: (value) => new Date(value).toLocaleDateString(),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 180,
      valueFormatter: (value) => new Date(value).toLocaleString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => handleView(params.row)} title="View">
            <Visibility />
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEdit(params.row)}
            title="Edit"
          >
            <Edit />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.row)}
            title="Delete"
          >
            <Delete />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 3, 
          border: '1px solid',
          borderColor: 'grey.200',
          borderRadius: 2,
          bgcolor: 'background.paper'
        }}
      >
        <Box display="flex" justifyContent="center" alignItems="center" mb={3}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 600, 
              color: 'primary.main',
              textAlign: 'center',
              width: '100%'
            }}
          >
            Orders Management
          </Typography>
        </Box>

        <Paper 
          elevation={1} 
          sx={{ 
            height: 600, 
            width: '100%',
            border: '1px solid',
            borderColor: 'grey.300',
            borderRadius: 2
          }}
        >
        <DataGrid
          rows={filteredOrders || []}
          columns={columns}
          getRowId={(row) => row._id}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
          slots={{
            toolbar: CustomToolbar as unknown as GridSlots['toolbar'],
          }}
          slotProps={{
            toolbar: {
              searchQuery,
              setSearchQuery,
              statusFilter,
              setStatusFilter,
              paymentFilter,
              setPaymentFilter,
              statuses,
            } as never,
          }}
        />
      </Paper>
      </Paper>
      {/* View Modal */}
      <ViewModal
        open={modalState.open && modalState.mode === 'view'}
        order={modalState.order}
        onClose={closeModal}
        statuses={statuses}
      />

      {/* Edit Modal */}
      <OrderFormModal
        open={modalState.open && modalState.mode === 'edit'}
        onClose={closeModal}
        onSubmit={handleSubmit}
        order={modalState.order}
        isLoading={updateOrder.isPending}
      />

      {/* Delete Modal */}
      <DeleteModal
        open={modalState.open && modalState.mode === 'delete'}
        order={modalState.order}
        onClose={closeModal}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteOrder.isPending}
      />
    </Box>
  );
};
