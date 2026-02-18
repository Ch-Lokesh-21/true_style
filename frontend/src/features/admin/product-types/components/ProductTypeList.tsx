import React, { useMemo, useState } from 'react';
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
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Visibility, Edit, Delete, Add } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import {
  useProductTypes,
  useCreateProductType,
  useUpdateProductType,
  useDeleteProductType,
} from '../hooks/useProductTypes';
import type { ProductType, ProductTypeFormData, ProductTypeUpdate } from '../types';

function ProductTypeToolbar({ searchQuery, onSearchChange }: { searchQuery: string; onSearchChange: (value: string) => void }) {
  return (
    <Box sx={{ p: 2, gap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
      <TextField
        size="small"
        placeholder="Search product types..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ minWidth: 300 }}
      />
    </Box>
  );
}

const ViewModal: React.FC<{ open: boolean; item: ProductType | null; onClose: () => void }> = ({ open, item, onClose }) => {
  if (!item) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>View Product Type</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Type
            </Typography>
            <Typography variant="body1">{item.type}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Size Chart URL
            </Typography>
            <Typography variant="body1">{item.size_chart_url}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Thumbnail URL
            </Typography>
            <Typography variant="body1">{item.thumbnail_url}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Created At
            </Typography>
            <Typography variant="body1">
              {new Date(item.createdAt).toLocaleString()}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Updated At
            </Typography>
            <Typography variant="body1">
              {new Date(item.updatedAt).toLocaleString()}
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

const EditModal: React.FC<{
  open: boolean;
  item: ProductType | null;
  mode: 'create' | 'edit';
  onClose: () => void;
}> = ({ open, item, mode, onClose }) => {
  const createMutation = useCreateProductType();
  const updateMutation = useUpdateProductType();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductTypeFormData>({
    defaultValues: {
      type: item?.type || '',
    },
  });

  React.useEffect(() => {
    if (item) {
      reset({
        type: item.type,
      });
    } else {
      reset({ type: '' });
    }
  }, [item, reset, open]);

  const onSubmit = async (data: ProductTypeFormData) => {
    if (mode === 'create') {
      if (!data.size_chart?.[0] || !data.thumbnail?.[0]) {
        return;
      }

      await createMutation.mutateAsync({
        type: data.type,
        size_chart: data.size_chart[0],
        thumbnail: data.thumbnail[0],
      });
    } else if (mode === 'edit' && item) {
      const payload: ProductTypeUpdate = {
        type: data.type,
      };

      if (data.size_chart?.[0]) {
        payload.size_chart = data.size_chart[0];
      }
      if (data.thumbnail?.[0]) {
        payload.thumbnail = data.thumbnail[0];
      }

      await updateMutation.mutateAsync({ id: item._id, data: payload });
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{mode === 'create' ? 'Create Product Type' : 'Edit Product Type'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Type"
              fullWidth
              required
              {...register('type', {
                required: 'Type is required',
                minLength: { value: 2, message: 'Type must be at least 2 characters' },
                maxLength: { value: 100, message: 'Type must be at most 100 characters' },
              })}
              error={!!errors.type}
              helperText={errors.type?.message}
            />
            <Button variant="outlined" component="label" fullWidth>
              {mode === 'create' ? 'Upload Size Chart' : 'Change Size Chart'}
              <input
                type="file"
                hidden
                accept="image/*,application/pdf"
                {...register('size_chart', {
                  required: mode === 'create' ? 'Size chart file is required' : false,
                })}
              />
            </Button>
            {errors.size_chart && (
              <Typography variant="caption" color="error">
                {errors.size_chart.message as string}
              </Typography>
            )}
            <Button variant="outlined" component="label" fullWidth>
              {mode === 'create' ? 'Upload Thumbnail' : 'Change Thumbnail'}
              <input
                type="file"
                hidden
                accept="image/*"
                {...register('thumbnail', {
                  required: mode === 'create' ? 'Thumbnail file is required' : false,
                })}
              />
            </Button>
            {errors.thumbnail && (
              <Typography variant="caption" color="error">
                {errors.thumbnail.message as string}
              </Typography>
            )}
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

const DeleteModal: React.FC<{
  open: boolean;
  item: ProductType | null;
  onClose: () => void;
}> = ({ open, item, onClose }) => {
  const deleteMutation = useDeleteProductType();

  const handleDelete = async () => {
    if (item) {
      await deleteMutation.mutateAsync(item._id);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete the product type "{item?.type}"? This action cannot be undone.
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

export const ProductTypeList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
  const { data, isLoading, error } = useProductTypes({
    skip: paginationModel.page * paginationModel.pageSize,
    limit: paginationModel.pageSize,
  });

  const items = useMemo(() => {
    if (!data) return [];
    if (!Array.isArray(data)) return [];
    return data.filter((item) => item._id);
  }, [data]);

  const filteredItems = useMemo(() => {
    const base = items;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return base;
    return base.filter((item) => item.type.toLowerCase().includes(q));
  }, [items, searchQuery]);

  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: 'view' | 'edit' | 'create' | 'delete';
    item: ProductType | null;
  }>({
    open: false,
    mode: 'view',
    item: null,
  });

  const handleView = (item: ProductType) => {
    setModalState({ open: true, mode: 'view', item });
  };

  const handleEdit = (item: ProductType) => {
    setModalState({ open: true, mode: 'edit', item });
  };

  const handleDelete = (item: ProductType) => {
    setModalState({ open: true, mode: 'delete', item });
  };

  const handleCreate = () => {
    setModalState({ open: true, mode: 'create', item: null });
  };

  const handleCloseModal = () => {
    setModalState({ open: false, mode: 'view', item: null });
  };

  const columns: GridColDef[] = [
    {
      field: 'type',
      headerName: 'Type',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'size_chart_url',
      headerName: 'Size Chart URL',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'thumbnail_url',
      headerName: 'Thumbnail URL',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 180,
      valueFormatter: (value) => new Date(value as string).toLocaleDateString(),
    },
    {
      field: 'updatedAt',
      headerName: 'Updated At',
      width: 180,
      valueFormatter: (value) => new Date(value as string).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const row = params.row as ProductType;
        return (
          <Box>
            <IconButton size="small" onClick={() => handleView(row)}>
              <Visibility fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => handleEdit(row)}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => handleDelete(row)}>
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Product Types</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>
          Add Product Type
        </Button>
      </Box>

      <Paper sx={{ height: 'calc(100% - 64px)', display: 'flex', flexDirection: 'column' }}>
        <ProductTypeToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <Box sx={{ flex: 1 }}>
          <DataGrid
            rows={filteredItems}
            columns={columns}
            getRowId={(row) => row._id}
            loading={isLoading}
            autoHeight={false}
            disableRowSelectionOnClick
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 25, 50, 100]}
            sx={{ border: 0 }}
          />
        </Box>
        {error && (
          <Box sx={{ p: 2 }}>
            <Typography color="error">Failed to load product types.</Typography>
          </Box>
        )}
      </Paper>

      {modalState.mode === 'view' && (
        <ViewModal open={modalState.open} item={modalState.item} onClose={handleCloseModal} />
      )}
      {['edit', 'create'].includes(modalState.mode) && (
        <EditModal
          open={modalState.open}
          item={modalState.item}
          mode={modalState.mode as 'create' | 'edit'}
          onClose={handleCloseModal}
        />
      )}
      {modalState.mode === 'delete' && (
        <DeleteModal open={modalState.open} item={modalState.item} onClose={handleCloseModal} />
      )}
    </Box>
  );
};
