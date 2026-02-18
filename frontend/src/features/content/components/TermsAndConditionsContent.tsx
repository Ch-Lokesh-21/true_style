import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import {
  useTermsAndConditionsList,
  useCreateTermsAndConditions,
  useUpdateTermsAndConditions,
  useDeleteTermsAndConditions,
} from '../hooks/useContent';
import type { TermsAndConditions, TermsAndConditionsFormData } from '../types';

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  item: TermsAndConditions | null;
  mode: 'view' | 'edit' | 'create';
}

const FormModal: React.FC<FormModalProps> = ({ open, onClose, item, mode }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TermsAndConditionsFormData>({
    defaultValues: {
      idx: item?.idx?.toString() || '0',
      description: item?.description || '',
    },
  });

  const createMutation = useCreateTermsAndConditions();
  const updateMutation = useUpdateTermsAndConditions();
  const isLoading = createMutation.isPending || updateMutation.isPending;

  React.useEffect(() => {
    if (open) {
      reset({
        idx: item?.idx?.toString() || '0',
        description: item?.description || '',
      });
    }
  }, [open, item, reset]);

  const onSubmit = async (data: TermsAndConditionsFormData) => {
    const payload = {
      idx: parseInt(data.idx, 10),
      description: data.description,
    };

    if (mode === 'create') {
      await createMutation.mutateAsync(payload);
    } else if (mode === 'edit' && item) {
      await updateMutation.mutateAsync({ id: item._id, data: payload });
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === 'view' ? 'View' : mode === 'edit' ? 'Edit' : 'Create'} Terms and Conditions
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              name="idx"
              control={control}
              rules={{ required: 'Display order is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Display Order"
                  type="number"
                  fullWidth
                  disabled={mode === 'view'}
                  error={!!errors.idx}
                  helperText={errors.idx?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              rules={{ required: 'Description is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  multiline
                  rows={6}
                  fullWidth
                  disabled={mode === 'view'}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          {mode !== 'view' && (
            <Button type="submit" variant="contained" disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : mode === 'edit' ? 'Update' : 'Create'}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};

interface DeleteModalProps {
  open: boolean;
  onClose: () => void;
  item: TermsAndConditions | null;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ open, onClose, item }) => {
  const deleteMutation = useDeleteTermsAndConditions();

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
        Are you sure you want to delete this terms and conditions item? This action cannot be undone.
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={deleteMutation.isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? <CircularProgress size={24} /> : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const TermsAndConditionsContent: React.FC = () => {
  const { data, isLoading, error } = useTermsAndConditionsList();
  
  const items = React.useMemo(() => {
    if (!data) return [];
    if (!Array.isArray(data)) return [];
    return data.filter(item => item._id);
  }, [data]);
  
  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: 'view' | 'edit' | 'create';
    item: TermsAndConditions | null;
  }>({
    open: false,
    mode: 'view',
    item: null,
  });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: TermsAndConditions | null }>({
    open: false,
    item: null,
  });

  React.useEffect(() => {
    if (error) {
      console.error('Error loading terms:', error);
    }
  }, [error]);

  const columns: GridColDef<TermsAndConditions>[] = useMemo(
    () => [
      { field: 'idx', headerName: 'Order', width: 100, sortable: true },
      { field: 'description', headerName: 'Description', flex: 1, sortable: true },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 150,
        sortable: false,
        renderCell: (params) => (
          <Box>
            <IconButton
              size="small"
              onClick={() => setModalState({ open: true, mode: 'view', item: params.row })}
              title="View"
            >
              <ViewIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setModalState({ open: true, mode: 'edit', item: params.row })}
              title="Edit"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setDeleteModal({ open: true, item: params.row })}
              title="Delete"
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    []
  );

  const handleCloseModal = () => {
    setModalState({ open: false, mode: 'view', item: null });
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ open: false, item: null });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Box />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setModalState({ open: true, mode: 'create', item: null })}
        >
          Add Terms and Conditions
        </Button>
      </Box>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={items}
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
          }}
        />
      </Box>

      <FormModal
        open={modalState.open}
        onClose={handleCloseModal}
        item={modalState.item}
        mode={modalState.mode}
      />

      <DeleteModal
        open={deleteModal.open}
        onClose={handleCloseDeleteModal}
        item={deleteModal.item}
      />
    </Box>
  );
};
