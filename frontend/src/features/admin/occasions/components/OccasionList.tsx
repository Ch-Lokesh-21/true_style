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
  useOccasions,
  useCreateOccasion,
  useUpdateOccasion,
  useDeleteOccasion,
} from '../hooks/useOccasions';
import type { Occasion, OccasionFormData } from '../types';

// Custom Toolbar with Search
function CustomToolbar({ searchQuery, onSearchChange }: { searchQuery: string; onSearchChange: (value: string) => void }) {
  return (
    <Box sx={{ p: 2, gap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
      <TextField
        size="small"
        placeholder="Search occasions..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ minWidth: 300 }}
      />
    </Box>
  );
}

// View Modal
const ViewModal: React.FC<{ open: boolean; occasion: Occasion | null; onClose: () => void }> = ({ open, occasion, onClose }) => {
  if (!occasion) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>View Occasion</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Occasion Name
            </Typography>
            <Typography variant="body1">{occasion.occasion}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Created At
            </Typography>
            <Typography variant="body1">
              {new Date(occasion.createdAt).toLocaleString()}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Updated At
            </Typography>
            <Typography variant="body1">
              {new Date(occasion.updatedAt).toLocaleString()}
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
  occasion: Occasion | null;
  mode: 'create' | 'edit';
  onClose: () => void;
}> = ({ open, occasion, mode, onClose }) => {
  const createMutation = useCreateOccasion();
  const updateMutation = useUpdateOccasion();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OccasionFormData>({
    defaultValues: {
      occasion: occasion?.occasion || '',
    },
  });

  React.useEffect(() => {
    if (occasion) {
      reset({ occasion: occasion.occasion });
    } else {
      reset({ occasion: '' });
    }
  }, [occasion, reset, open]);

  const onSubmit = async (data: OccasionFormData) => {
    if (mode === 'create') {
      await createMutation.mutateAsync(data);
    } else if (mode === 'edit' && occasion) {
      await updateMutation.mutateAsync({ id: occasion._id, data });
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{mode === 'create' ? 'Create Occasion' : 'Edit Occasion'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Occasion Name"
              fullWidth
              required
              {...register('occasion', {
                required: 'Occasion name is required',
                minLength: { value: 2, message: 'Occasion name must be at least 2 characters' },
                maxLength: { value: 100, message: 'Occasion name must be at most 100 characters' },
              })}
              error={!!errors.occasion}
              helperText={errors.occasion?.message}
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
  occasion: Occasion | null;
  onClose: () => void;
}> = ({ open, occasion, onClose }) => {
  const deleteMutation = useDeleteOccasion();

  const handleDelete = async () => {
    if (occasion) {
      await deleteMutation.mutateAsync(occasion._id);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete the occasion "{occasion?.occasion}"? This action cannot be undone.
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

export const OccasionList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading, error } = useOccasions({ q: searchQuery || undefined });

  // Safely handle data
  const occasions = useMemo(() => {
    if (!data) return [];
    if (!Array.isArray(data)) return [];
    return data.filter((item) => item._id);
  }, [data]);

  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: 'view' | 'edit' | 'create' | 'delete';
    occasion: Occasion | null;
  }>({
    open: false,
    mode: 'view',
    occasion: null,
  });

  const handleView = (occasion: Occasion) => {
    setModalState({ open: true, mode: 'view', occasion });
  };

  const handleEdit = (occasion: Occasion) => {
    setModalState({ open: true, mode: 'edit', occasion });
  };

  const handleDelete = (occasion: Occasion) => {
    setModalState({ open: true, mode: 'delete', occasion });
  };

  const handleCreate = () => {
    setModalState({ open: true, mode: 'create', occasion: null });
  };

  const handleCloseModal = () => {
    setModalState({ open: false, mode: 'view', occasion: null });
  };

  const columns: GridColDef[] = [
    {
      field: 'occasion',
      headerName: 'Occasion Name',
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
            onClick={() => handleView(params.row as Occasion)}
            color="primary"
          >
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleEdit(params.row as Occasion)}
            color="info"
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row as Occasion)}
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
        <Typography color="error">Error loading occasions: {String(error)}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', width: '100%', p: 3 }}>
      <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Occasions</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
          >
            Add Occasion
          </Button>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <CustomToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          <DataGrid
            rows={occasions}
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
          occasion={modalState.occasion}
          onClose={handleCloseModal}
        />
      )}

      {(modalState.mode === 'edit' || modalState.mode === 'create') && (
        <EditModal
          open={modalState.open}
          occasion={modalState.occasion}
          mode={modalState.mode}
          onClose={handleCloseModal}
        />
      )}

      {modalState.mode === 'delete' && (
        <DeleteModal
          open={modalState.open}
          occasion={modalState.occasion}
          onClose={handleCloseModal}
        />
      )}
    </Box>
  );
};
