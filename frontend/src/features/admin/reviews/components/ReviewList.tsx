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
  useReviews,
  useUpdateReviewStatus,
  useDeleteReview,
  useReviewStatuses,
} from '../hooks/useReviews';
import { ReviewFormModal } from './ReviewFormModal';
import { useUsers } from '../../users/hooks/useUsers';
import { useProducts } from '../../products/hooks/useProducts';
import type { Review, ReviewFormData, ReviewStatus } from '../types';
import type { User } from '../../users/types';
import type { Product } from '../../products/types';

interface CustomToolbarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  productFilter: string;
  setProductFilter: (value: string) => void;
  userFilter: string;
  setUserFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  products?: Product[];
  users?: User[];
  statuses?: ReviewStatus[];
}

// Custom Toolbar with Search and Filters
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const CustomToolbar: React.FC<CustomToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  productFilter,
  setProductFilter,
  userFilter,
  setUserFilter,
  statusFilter,
  setStatusFilter,
  products,
  users,
  statuses,
}) => {
  return (
    <Box sx={{ p: 2, width: '100%' }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            fullWidth
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Product</InputLabel>
            <Select
              value={productFilter}
              label="Product"
              onChange={(e) => setProductFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {products?.map((product) => (
                <MenuItem key={product._id} value={product._id}>
                  {product.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>User</InputLabel>
            <Select value={userFilter} label="User" onChange={(e) => setUserFilter(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {users?.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.full_name || user.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
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
              setProductFilter('');
              setUserFilter('');
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
  review: Review | null;
  onClose: () => void;
  products?: Product[];
  users?: User[];
  statuses?: ReviewStatus[];
}

// View Modal Component
const ViewModal: React.FC<ViewModalProps> = ({
  open,
  review,
  onClose,
  products,
  users,
  statuses,
}) => {
  if (!review) return null;

  const product = products?.find((p) => p._id === review.product_id);
  const user = users?.find((u) => u._id === review.user_id);
  const status = statuses?.find((s) => s._id === review.review_status_id);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Review Details</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', gap: 3 }}>
          {review.image_url && (
            <Box sx={{ flex: '0 0 200px' }}>
              <Box
                component="img"
                src={review.image_url}
                alt="Review"
                sx={{
                  width: '100%',
                  height: 200,
                  objectFit: 'cover',
                  borderRadius: 1,
                }}
              />
            </Box>
          )}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Product
              </Typography>
              <Typography variant="body1">{product?.name || 'N/A'}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                User
              </Typography>
              <Typography variant="body1">{user?.full_name || user?.email || 'N/A'}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              <Chip
                label={status?.status || 'N/A'}
                color={
                  status?.status === 'approved'
                    ? 'success'
                    : status?.status === 'rejected'
                    ? 'error'
                    : 'warning'
                }
                size="small"
              />
            </Box>
            {review.review && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Review Text
                </Typography>
                <Typography variant="body1">{review.review}</Typography>
              </Box>
            )}
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Created At
              </Typography>
              <Typography variant="body1">
                {new Date(review.createdAt).toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Updated At
              </Typography>
              <Typography variant="body1">
                {new Date(review.updatedAt).toLocaleString()}
              </Typography>
            </Box>
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
  review: Review | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

// Delete Modal Component
const DeleteModal: React.FC<DeleteModalProps> = ({
  open,
  review,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this review? This action cannot be undone.
          {review?.review && (
            <>
              <br />
              <strong>Review:</strong> {review.review.substring(0, 100)}
              {review.review.length > 100 && '...'}
            </>
          )}
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

export const ReviewList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: 'view' | 'edit' | 'delete';
    review: Review | null;
  }>({
    open: false,
    mode: 'view',
    review: null,
  });

  const {
    data: reviews,
    isLoading,
    refetch,
  } = useReviews({
    q: searchQuery,
    product_id: productFilter,
    user_id: userFilter,
    review_status_id: statusFilter,
  });
  const { data: products } = useProducts({});
  const { data: users } = useUsers({}); // Assuming this exists
  const { data: statuses } = useReviewStatuses();

  const updateReviewStatus = useUpdateReviewStatus();
  const deleteReview = useDeleteReview();

  useEffect(() => {
    refetch();
  }, [searchQuery, productFilter, userFilter, statusFilter, refetch]);

  const closeModal = () => {
    setModalState({ open: false, mode: 'view', review: null });
  };

  const handleView = (review: Review) => {
    setModalState({ open: true, mode: 'view', review });
  };

  const handleEdit = (review: Review) => {
    setModalState({ open: true, mode: 'edit', review });
  };

  const handleDelete = (review: Review) => {
    setModalState({ open: true, mode: 'delete', review });
  };

  const handleConfirmDelete = () => {
    if (modalState.review) {
      deleteReview.mutate(modalState.review._id, {
        onSuccess: closeModal,
      });
    }
  };

  const handleSubmit = (data: ReviewFormData) => {
    if (modalState.review) {
      updateReviewStatus.mutate(
        { id: modalState.review._id, data },
        {
          onSuccess: closeModal,
        }
      );
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'product_id',
      headerName: 'Product',
      flex: 1,
      minWidth: 200,
      valueGetter: (_value, row) => {
        const product = products?.find((p) => p._id === row.product_id);
        return product?.name || 'N/A';
      },
    },
    {
      field: 'user_id',
      headerName: 'User',
      width: 180,
      valueGetter: (_value, row) => {
        const user = users?.find((u: User) => u._id === row.user_id);
        return user?.full_name || user?.email || 'N/A';
      },
    },
    {
      field: 'review',
      headerName: 'Review Text',
      flex: 1,
      minWidth: 250,
      valueFormatter: (value: string) => {
        if (!value) return 'No text';
        return value.length > 100 ? value.substring(0, 100) + '...' : value;
      },
    },
    {
      field: 'review_status_id',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const status = statuses?.find((s) => s._id === params.value);
        return (
          <Chip
            label={status?.status || 'N/A'}
            color={
              status?.status === 'approved'
                ? 'success'
                : status?.status === 'rejected'
                ? 'error'
                : 'warning'
            }
            size="small"
          />
        );
      },
    },
    {
      field: 'image_url',
      headerName: 'Has Image',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
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
    <Box 
      sx={{ 
        height: '100%', 
        width: '100%', 
        p: 4,
        backgroundColor: (theme) => theme.palette.grey[50]
      }}
    >
      <Paper 
        elevation={2}
        sx={{ 
          border: '1px solid',
          borderColor: (theme) => theme.palette.grey[300],
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
        <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid', borderColor: (theme) => theme.palette.grey[200] }}>
          <Typography 
            variant="h4" 
            sx={{ 
              textAlign: 'center',
              color: 'primary.main',
              fontWeight: 600,
              mb: 2
            }}
          >
            Reviews Management
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <DataGrid
            rows={reviews || []}
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
                productFilter,
                setProductFilter,
                userFilter,
                setUserFilter,
                statusFilter,
                setStatusFilter,
                products,
                users,
                statuses,
              } as never,
            }}
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-row:hover': {
                cursor: 'pointer',
              },
            }}
          />
        </Box>
      </Paper>
      
      {/* View Modal */}
      <ViewModal
        open={modalState.open && modalState.mode === 'view'}
        review={modalState.review}
        onClose={closeModal}
        products={products}
        users={users}
        statuses={statuses}
      />

      {/* Edit Status Modal */}
      <ReviewFormModal
        open={modalState.open && modalState.mode === 'edit'}
        onClose={closeModal}
        onSubmit={handleSubmit}
        review={modalState.review}
        isLoading={updateReviewStatus.isPending}
      />

      {/* Delete Modal */}
      <DeleteModal
        open={modalState.open && modalState.mode === 'delete'}
        review={modalState.review}
        onClose={closeModal}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteReview.isPending}
      />
    </Box>
  );
};