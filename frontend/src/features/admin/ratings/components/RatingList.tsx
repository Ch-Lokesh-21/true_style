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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating as MuiRating,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridSlots,
} from '@mui/x-data-grid';
import { Visibility, Delete } from '@mui/icons-material';
import { useRatings, useDeleteRating } from '../hooks/useRatings';
import { useUsers } from '../../users/hooks/useUsers';
import { useProducts } from '../../products/hooks/useProducts';
import type { Rating } from '../types';
import type { User } from '../../users/types';
import type { Product } from '../../products/types';

interface CustomToolbarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  productFilter: string;
  setProductFilter: (value: string) => void;
  userFilter: string;
  setUserFilter: (value: string) => void;
  ratingFilter: string;
  setRatingFilter: (value: string) => void;
  products?: Product[];
  users?: User[];
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
  ratingFilter,
  setRatingFilter,
  products,
  users,
}) => {
  return (
    <Box sx={{ p: 2, width: '100%' }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            fullWidth
            placeholder="Search ratings..."
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
            <InputLabel>Rating</InputLabel>
            <Select
              value={ratingFilter}
              label="Rating"
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="5">5 Stars</MenuItem>
              <MenuItem value="4">4 Stars</MenuItem>
              <MenuItem value="3">3 Stars</MenuItem>
              <MenuItem value="2">2 Stars</MenuItem>
              <MenuItem value="1">1 Star</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchQuery('');
              setProductFilter('');
              setUserFilter('');
              setRatingFilter('');
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
  rating: Rating | null;
  onClose: () => void;
  products?: Product[];
  users?: User[];
}

// View Modal Component
const ViewModal: React.FC<ViewModalProps> = ({ open, rating, onClose, products, users }) => {
  if (!rating) return null;

  const product = products?.find((p) => p._id === rating.product_id);
  const user = users?.find((u) => u._id === rating.user_id);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Rating Details</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
              Rating
            </Typography>
            <MuiRating value={rating.rating} readOnly />
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Created At
            </Typography>
            <Typography variant="body1">
              {new Date(rating.createdAt).toLocaleString()}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Updated At
            </Typography>
            <Typography variant="body1">
              {new Date(rating.updatedAt).toLocaleString()}
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
  rating: Rating | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

// Delete Modal Component
const DeleteModal: React.FC<DeleteModalProps> = ({
  open,
  rating,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  const product = rating ? `Rating for product ${rating.product_id.slice(-8)}` : '';

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this rating? This action cannot be undone.
          {rating && (
            <>
              <br />
              <strong>{product}</strong> - {rating.rating} stars
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

export const RatingList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: 'view' | 'delete';
    rating: Rating | null;
  }>({
    open: false,
    mode: 'view',
    rating: null,
  });

  const {
    data: ratings,
    isLoading,
    refetch,
  } = useRatings({
    q: searchQuery,
    product_id: productFilter,
    user_id: userFilter,
  });
  const { data: products } = useProducts({});
  const { data: users } = useUsers({}); // Assuming this exists

  const deleteRating = useDeleteRating();

  useEffect(() => {
    refetch();
  }, [searchQuery, productFilter, userFilter, ratingFilter, refetch]);

  const closeModal = () => {
    setModalState({ open: false, mode: 'view', rating: null });
  };

  const handleView = (rating: Rating) => {
    setModalState({ open: true, mode: 'view', rating });
  };

  const handleDelete = (rating: Rating) => {
    setModalState({ open: true, mode: 'delete', rating });
  };

  const handleConfirmDelete = () => {
    if (modalState.rating) {
      deleteRating.mutate(modalState.rating._id, {
        onSuccess: closeModal,
      });
    }
  };

  const filteredRatings = ratings?.filter((rating) => {
    if (ratingFilter && rating.rating !== parseInt(ratingFilter)) return false;
    return true;
  });

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
      field: 'rating',
      headerName: 'Rating',
      width: 150,
      renderCell: (params) => <MuiRating value={params.value} readOnly size="small" />,
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
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => handleView(params.row)} title="View">
            <Visibility />
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
            Ratings Management
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <DataGrid
            rows={filteredRatings || []}
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
                ratingFilter,
                setRatingFilter,
                products,
                users,
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
        rating={modalState.rating}
        onClose={closeModal}
        products={products}
        users={users}
      />

      {/* Delete Modal */}
      <DeleteModal
        open={modalState.open && modalState.mode === 'delete'}
        rating={modalState.rating}
        onClose={closeModal}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteRating.isPending}
      />
    </Box>
  );
};