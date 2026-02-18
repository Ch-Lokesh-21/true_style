import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Paper,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
} from '@mui/x-data-grid';
import { Visibility, Edit, Delete, Add } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import {
  useBrands,
  useCreateBrand,
  useUpdateBrand,
  useDeleteBrand,
} from '../hooks/useBrands';
import type { Brand, BrandFormData } from '../types';

// Custom Toolbar with Search
function CustomToolbar({ searchQuery, onSearchChange }: { searchQuery: string; onSearchChange: (value: string) => void }) {
  return (
    <Box sx={{ p: 2, gap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
      <TextField
        size="small"
        placeholder="Search brands..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ minWidth: 300 }}
      />
    </Box>
  );
}

// View Modal
const ViewModal: React.FC<{ open: boolean; brand: Brand | null; onClose: () => void }> = ({ open, brand, onClose }) => {
  if (!brand) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>View Brand</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Brand Name
            </Typography>
            <Typography variant="body1">{brand.name}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Created At
            </Typography>
            <Typography variant="body1">
              {new Date(brand.createdAt).toLocaleString()}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Updated At
            </Typography>
            <Typography variant="body1">
              {new Date(brand.updatedAt).toLocaleString()}
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

// Edit/Create Modal
const EditModal: React.FC<{
  open: boolean;
  brand: Brand | null;
  mode: 'create' | 'edit';
  onClose: () => void;
}> = ({ open, brand, mode, onClose }) => {
  const createMutation = useCreateBrand();
  const updateMutation = useUpdateBrand();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BrandFormData>({
    defaultValues: {
      name: brand?.name || '',
    },
  });

  React.useEffect(() => {
    if (brand) {
      reset({ name: brand.name });
    } else {
      reset({ name: '' });
    }
  }, [brand, reset, open]);

  const onSubmit = async (data: BrandFormData) => {
    if (mode === 'create') {
      await createMutation.mutateAsync(data);
    } else if (mode === 'edit' && brand) {
      await updateMutation.mutateAsync({ id: brand._id, data });
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{mode === 'create' ? 'Create Brand' : 'Edit Brand'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Brand Name"
              fullWidth
              required
              {...register('name', {
                required: 'Brand name is required',
                minLength: { value: 2, message: 'Brand name must be at least 2 characters' },
                maxLength: { value: 100, message: 'Brand name must be at most 100 characters' },
              })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// Delete Confirmation Modal
const DeleteModal: React.FC<{
  open: boolean;
  brand: Brand | null;
  onClose: () => void;
}> = ({ open, brand, onClose }) => {
  const deleteMutation = useDeleteBrand();

  const handleDelete = async () => {
    if (brand) {
      await deleteMutation.mutateAsync(brand._id);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete the brand "{brand?.name}"? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={deleteMutation.isPending}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const BrandList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading, error } = useBrands({ q: searchQuery || undefined });

  // Safely handle data
  const brands = useMemo(() => {
    if (!data) return [];
    if (!Array.isArray(data)) return [];
    return data.filter((item) => item._id);
  }, [data]);

  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: 'view' | 'edit' | 'create' | 'delete';
    brand: Brand | null;
  }>({
    open: false,
    mode: 'view',
    brand: null,
  });

  const handleView = (brand: Brand) => {
    setModalState({ open: true, mode: 'view', brand });
  };

  const handleEdit = (brand: Brand) => {
    setModalState({ open: true, mode: 'edit', brand });
  };

  const handleDelete = (brand: Brand) => {
    setModalState({ open: true, mode: 'delete', brand });
  };

  const handleCreate = () => {
    setModalState({ open: true, mode: 'create', brand: null });
  };

  const handleCloseModal = () => {
    setModalState({ open: false, mode: 'view', brand: null });
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Brand Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 180,
      valueFormatter: (value) => {
        return new Date(value).toLocaleDateString();
      },
    },
    {
      field: 'updatedAt',
      headerName: 'Updated At',
      width: 180,
      valueFormatter: (value) => {
        return new Date(value).toLocaleDateString();
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => handleView(params.row as Brand)}
            color="primary"
          >
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleEdit(params.row as Brand)}
            color="info"
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row as Brand)}
            color="error"
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error loading brands: {String(error)}</Typography>
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
            Brands Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
          >
            Add Brand
          </Button>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <CustomToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          <DataGrid
            rows={brands}
            columns={columns}
            loading={isLoading}
            getRowId={(row) => row._id}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
            }}
            disableRowSelectionOnClick
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

      {modalState.mode === 'view' && (
        <ViewModal
          open={modalState.open}
          brand={modalState.brand}
          onClose={handleCloseModal}
        />
      )}

      {(modalState.mode === 'edit' || modalState.mode === 'create') && (
        <EditModal
          open={modalState.open}
          brand={modalState.brand}
          mode={modalState.mode}
          onClose={handleCloseModal}
        />
      )}

      {modalState.mode === 'delete' && (
        <DeleteModal
          open={modalState.open}
          brand={modalState.brand}
          onClose={handleCloseModal}
        />
      )}
    </Box>
  );
};
