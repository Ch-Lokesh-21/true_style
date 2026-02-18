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
  useExchanges,
  useUpdateExchangeStatus,
  useDeleteExchange,
  useExchangeStatuses,
} from '../hooks/useExchanges';
import { ExchangeFormModal } from './ExchangeFormModal';
import type { Exchange, ExchangeStatus } from '../types';

interface CustomToolbarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  statuses?: ExchangeStatus[];
}

// Custom Toolbar with Search and Filters
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const CustomToolbar: React.FC<CustomToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  statuses,
}) => {
  return (
    <Box sx={{ p: 2, width: '100%' }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          fullWidth
          placeholder="Search by exchange ID, order ID, or user..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
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
        <Button
          variant="outlined"
          onClick={() => {
            setSearchQuery('');
            setStatusFilter('');
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
  exchange: Exchange | null;
  onClose: () => void;
  statuses?: ExchangeStatus[];
}

// View Modal Component
const ViewModal: React.FC<ViewModalProps> = ({ open, exchange, onClose, statuses }) => {
  if (!exchange) return null;

  const status = statuses?.find((s) => s._id === exchange.exchange_status_id);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Exchange Details</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6" gutterBottom>
            Exchange #{exchange._id}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2">
              <strong>Order ID:</strong> {exchange.order_id}
            </Typography>
            <Typography variant="body2">
              <strong>Product ID:</strong> {exchange.product_id}
            </Typography>
            <Typography variant="body2">
              <strong>User ID:</strong> {exchange.user_id}
            </Typography>
            <Typography variant="body2">
              <strong>Status:</strong>{' '}
              <Chip label={status?.status || 'N/A'} color="info" size="small" />
            </Typography>
            {exchange.original_size && (
              <Typography variant="body2">
                <strong>Original Size:</strong> {exchange.original_size}
              </Typography>
            )}
            {exchange.new_size && (
              <Typography variant="body2">
                <strong>New Size:</strong> {exchange.new_size}
              </Typography>
            )}
            {exchange.new_quantity && (
              <Typography variant="body2">
                <strong>New Quantity:</strong> {exchange.new_quantity}
              </Typography>
            )}
            {exchange.reason && (
              <Typography variant="body2">
                <strong>Reason:</strong> {exchange.reason}
              </Typography>
            )}
            {exchange.image_url && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Image:</strong>
                </Typography>
                <img
                  src={exchange.image_url}
                  alt="Exchange"
                  style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}
                />
              </Box>
            )}
            <Typography variant="body2">
              <strong>Created:</strong> {new Date(exchange.createdAt).toLocaleString()}
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
  exchange: Exchange | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

// Delete Modal Component
const DeleteModal: React.FC<DeleteModalProps> = ({
  open,
  exchange,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete exchange "#{exchange?._id}"? This action cannot be undone.
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

export const ExchangeList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: 'view' | 'edit' | 'delete';
    exchange: Exchange | null;
  }>({
    open: false,
    mode: 'view',
    exchange: null,
  });

  const { data: statuses } = useExchangeStatuses();
  const {
    data: exchanges,
    isLoading,
    refetch,
  } = useExchanges({
    exchange_status_id: statusFilter || undefined,
  });

  const updateExchangeStatus = useUpdateExchangeStatus();
  const deleteExchange = useDeleteExchange();

  useEffect(() => {
    refetch();
  }, [statusFilter, refetch]);

  const closeModal = () => {
    setModalState({ open: false, mode: 'view', exchange: null });
  };

  const handleView = (exchange: Exchange) => {
    setModalState({ open: true, mode: 'view', exchange });
  };

  const handleEdit = (exchange: Exchange) => {
    setModalState({ open: true, mode: 'edit', exchange });
  };

  const handleDelete = (exchange: Exchange) => {
    setModalState({ open: true, mode: 'delete', exchange });
  };

  const handleConfirmDelete = () => {
    if (modalState.exchange) {
      deleteExchange.mutate(modalState.exchange._id, {
        onSuccess: closeModal,
      });
    }
  };

  const handleSubmit = (data: { exchange_status_id?: string; status_id?: string }) => {
    if (modalState.mode === 'edit' && modalState.exchange) {
      updateExchangeStatus.mutate(
        {
          id: modalState.exchange._id,
          data: { exchange_status_id: data.exchange_status_id || data.status_id },
        },
        {
          onSuccess: closeModal,
        }
      );
    }
  };

  const filteredExchanges = exchanges?.filter((exchange) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      exchange._id.toLowerCase().includes(query) ||
      exchange.order_id.toLowerCase().includes(query) ||
      exchange.user_id.toLowerCase().includes(query) ||
      exchange.product_id.toLowerCase().includes(query)
    );
  });

  const columns: GridColDef[] = [
    {
      field: '_id',
      headerName: 'Exchange ID',
      width: 220,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.value.slice(0, 8)}...
        </Typography>
      ),
    },
    {
      field: 'order_id',
      headerName: 'Order ID',
      width: 220,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.value.slice(0, 8)}...
        </Typography>
      ),
    },
    {
      field: 'product_id',
      headerName: 'Product ID',
      width: 220,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.value.slice(0, 8)}...
        </Typography>
      ),
    },
    {
      field: 'exchange_status_id',
      headerName: 'Status',
      width: 180,
      valueGetter: (_value, row) => {
        const status = statuses?.find((s) => s._id === row.exchange_status_id);
        return status?.status || 'N/A';
      },
      renderCell: (params) => (
        <Chip label={params.value} color="info" size="small" />
      ),
    },
    {
      field: 'original_size',
      headerName: 'Original Size',
      width: 120,
      valueFormatter: (value) => value || '-',
    },
    {
      field: 'new_size',
      headerName: 'New Size',
      width: 120,
      valueFormatter: (value) => value || '-',
    },
    {
      field: 'new_quantity',
      headerName: 'New Qty',
      width: 100,
      type: 'number',
      valueFormatter: (value) => value || '-',
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
            title="Edit Status"
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
            Exchanges Management
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
          rows={filteredExchanges || []}
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
              statuses,
            } as never,
          }}
        />
      </Paper>
      </Paper>
      {/* View Modal */}
      <ViewModal
        open={modalState.open && modalState.mode === 'view'}
        exchange={modalState.exchange}
        onClose={closeModal}
        statuses={statuses}
      />

      {/* Edit Modal */}
      <ExchangeFormModal
        open={modalState.open && modalState.mode === 'edit'}
        onClose={closeModal}
        onSubmit={handleSubmit}
        exchange={modalState.exchange}
        isLoading={updateExchangeStatus.isPending}
      />

      {/* Delete Modal */}
      <DeleteModal
        open={modalState.open && modalState.mode === 'delete'}
        exchange={modalState.exchange}
        onClose={closeModal}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteExchange.isPending}
      />
    </Box>
  );
};
