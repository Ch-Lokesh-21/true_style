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
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../hooks/useCategories';
import type { Category, CategoryFormData } from '../types';

// Custom Toolbar with Search
function CustomToolbar({ searchQuery, onSearchChange }: { searchQuery: string; onSearchChange: (value: string) => void }) {
  return (
    <Box sx={{ p: 2, gap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
      <TextField
        size="small"
        placeholder="Search categories..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ minWidth: 300 }}
      />
    </Box>
  );
}

// View Modal
const ViewModal: React.FC<{ open: boolean; category: Category | null; onClose: () => void }> = ({ open, category, onClose }) => {
  if (!category) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>View Category</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Category Name
            </Typography>
            <Typography variant="body1">{category.category}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Created At
            </Typography>
            <Typography variant="body1">
              {new Date(category.createdAt).toLocaleString()}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Updated At
            </Typography>
            <Typography variant="body1">
              {new Date(category.updatedAt).toLocaleString()}
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
  category: Category | null;
  mode: 'create' | 'edit';
  onClose: () => void;
}> = ({ open, category, mode, onClose }) => {
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    defaultValues: {
      category: category?.category || '',
    },
  });

  React.useEffect(() => {
    if (category) {
      reset({ category: category.category });
    } else {
      reset({ category: '' });
    }
  }, [category, reset, open]);

  const onSubmit = async (data: CategoryFormData) => {
    if (mode === 'create') {
      await createMutation.mutateAsync(data);
    } else if (mode === 'edit' && category) {
      await updateMutation.mutateAsync({ id: category._id, data });
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{mode === 'create' ? 'Create Category' : 'Edit Category'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Category Name"
              fullWidth
              required
              {...register('category', {
                required: 'Category name is required',
                minLength: { value: 2, message: 'Category name must be at least 2 characters' },
                maxLength: { value: 100, message: 'Category name must be at most 100 characters' },
              })}
              error={!!errors.category}
              helperText={errors.category?.message}
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
  category: Category | null;
  onClose: () => void;
}> = ({ open, category, onClose }) => {
  const deleteMutation = useDeleteCategory();

  const handleDelete = async () => {
    if (category) {
      await deleteMutation.mutateAsync(category._id);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete the category "{category?.category}"? This action cannot be undone.
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

export const CategoryList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading, error } = useCategories({ q: searchQuery || undefined });

  // Safely handle data
  const categories = useMemo(() => {
    if (!data) return [];
    if (!Array.isArray(data)) return [];
    return data.filter((item) => item._id);
  }, [data]);

  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: 'view' | 'edit' | 'create' | 'delete';
    category: Category | null;
  }>({
    open: false,
    mode: 'view',
    category: null,
  });

  const handleView = (category: Category) => {
    setModalState({ open: true, mode: 'view', category });
  };

  const handleEdit = (category: Category) => {
    setModalState({ open: true, mode: 'edit', category });
  };

  const handleDelete = (category: Category) => {
    setModalState({ open: true, mode: 'delete', category });
  };

  const handleCreate = () => {
    setModalState({ open: true, mode: 'create', category: null });
  };

  const handleCloseModal = () => {
    setModalState({ open: false, mode: 'view', category: null });
  };

  const columns: GridColDef[] = [
    {
      field: 'category',
      headerName: 'Category Name',
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
            onClick={() => handleView(params.row as Category)}
            color="primary"
          >
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleEdit(params.row as Category)}
            color="info"
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row as Category)}
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
        <Typography color="error">Error loading categories: {String(error)}</Typography>
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
            Categories Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
          >
            Add Category
          </Button>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <CustomToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          <DataGrid
            rows={categories}
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
          category={modalState.category}
          onClose={handleCloseModal}
        />
      )}

      {(modalState.mode === 'edit' || modalState.mode === 'create') && (
        <EditModal
          open={modalState.open}
          category={modalState.category}
          mode={modalState.mode}
          onClose={handleCloseModal}
        />
      )}

      {modalState.mode === 'delete' && (
        <DeleteModal
          open={modalState.open}
          category={modalState.category}
          onClose={handleCloseModal}
        />
      )}
    </Box>
  );
};
