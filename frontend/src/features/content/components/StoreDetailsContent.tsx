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
  useStoreDetailsList,
  useCreateStoreDetails,
  useUpdateStoreDetails,
  useDeleteStoreDetails,
} from '../hooks/useContent';
import type { StoreDetails, StoreDetailsFormData } from '../types';

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  item: StoreDetails | null;
  mode: 'view' | 'edit' | 'create';
}

const FormModal: React.FC<FormModalProps> = ({ open, onClose, item, mode }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StoreDetailsFormData>({
    defaultValues: {
      name: item?.name || '',
      pan_no: item?.pan_no || '',
      gst_no: item?.gst_no || '',
      address: item?.address || '',
      postal_code: item?.postal_code?.toString() || '',
      country: item?.country || '',
      state: item?.state || '',
      city: item?.city || '',
    },
  });

  const createMutation = useCreateStoreDetails();
  const updateMutation = useUpdateStoreDetails();
  const isLoading = createMutation.isPending || updateMutation.isPending;

  React.useEffect(() => {
    if (open) {
      reset({
        name: item?.name || '',
        pan_no: item?.pan_no || '',
        gst_no: item?.gst_no || '',
        address: item?.address || '',
        postal_code: item?.postal_code?.toString() || '',
        country: item?.country || '',
        state: item?.state || '',
        city: item?.city || '',
      });
    }
  }, [open, item, reset]);

  const onSubmit = async (data: StoreDetailsFormData) => {
    const payload = {
      name: data.name,
      pan_no: data.pan_no,
      gst_no: data.gst_no,
      address: data.address,
      postal_code: parseInt(data.postal_code, 10),
      country: data.country,
      state: data.state,
      city: data.city,
    };

    if (mode === 'create') {
      await createMutation.mutateAsync(payload);
    } else if (mode === 'edit' && item) {
      await updateMutation.mutateAsync({ id: item._id, data: payload });
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'view' ? 'View' : mode === 'edit' ? 'Edit' : 'Create'} Store Details
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Store name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Store Name"
                  fullWidth
                  disabled={mode === 'view'}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Controller
                name="pan_no"
                control={control}
                rules={{
                  required: 'PAN number is required',
                  validate: (value) => {
                    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
                    return panRegex.test(value.toUpperCase()) || 'PAN format: AAAAA9999A';
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="PAN Number"
                    placeholder="e.g., AAABR5055K"
                    fullWidth
                    disabled={mode === 'view'}
                    error={!!errors.pan_no}
                    helperText={errors.pan_no?.message}
                  />
                )}
              />
              <Controller
                name="gst_no"
                control={control}
                rules={{
                  required: 'GST number is required',
                  validate: (value) => {
                    const gstRegex = /^\d{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;
                    return gstRegex.test(value.toUpperCase()) || 'GST format: 22AAAAA9999A1Z5';
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="GST Number"
                    placeholder="e.g., 22AAABR5055K1Z5"
                    fullWidth
                    disabled={mode === 'view'}
                    error={!!errors.gst_no}
                    helperText={errors.gst_no?.message}
                  />
                )}
              />
            </Box>
            <Controller
              name="address"
              control={control}
              rules={{ required: 'Address is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Address"
                  multiline
                  rows={2}
                  fullWidth
                  disabled={mode === 'view'}
                  error={!!errors.address}
                  helperText={errors.address?.message}
                />
              )}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Controller
                name="city"
                control={control}
                rules={{ required: 'City is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="City"
                    fullWidth
                    disabled={mode === 'view'}
                    error={!!errors.city}
                    helperText={errors.city?.message}
                  />
                )}
              />
              <Controller
                name="postal_code"
                control={control}
                rules={{
                  required: 'Postal code is required',
                  validate: (value) => {
                    const num = parseInt(value, 10);
                    if (isNaN(num)) return 'Postal code must be a number';
                    if (num < 100000 || num > 999999) return 'Postal code must be a 6-digit number';
                    return true;
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Postal Code"
                    type="number"
                    inputProps={{ min: 100000, max: 999999 }}
                    placeholder="6-digit postal code (100000-999999)"
                    fullWidth
                    disabled={mode === 'view'}
                    error={!!errors.postal_code}
                    helperText={errors.postal_code?.message}
                  />
                )}
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Controller
                name="state"
                control={control}
                rules={{ required: 'State is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="State"
                    fullWidth
                    disabled={mode === 'view'}
                    error={!!errors.state}
                    helperText={errors.state?.message}
                  />
                )}
              />
              <Controller
                name="country"
                control={control}
                rules={{ required: 'Country is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Country"
                    fullWidth
                    disabled={mode === 'view'}
                    error={!!errors.country}
                    helperText={errors.country?.message}
                  />
                )}
              />
            </Box>
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
  item: StoreDetails | null;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ open, onClose, item }) => {
  const deleteMutation = useDeleteStoreDetails();

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
        Are you sure you want to delete this store details? This action cannot be undone.
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

export const StoreDetailsContent: React.FC = () => {
  const { data, isLoading, error } = useStoreDetailsList();
  
  const items = React.useMemo(() => {
    if (!data) return [];
    if (!Array.isArray(data)) return [];
    return data.filter(item => item._id);
  }, [data]);
  
  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: 'view' | 'edit' | 'create';
    item: StoreDetails | null;
  }>({
    open: false,
    mode: 'view',
    item: null,
  });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: StoreDetails | null }>({
    open: false,
    item: null,
  });

  React.useEffect(() => {
    if (error) {
      console.error('Error loading store details:', error);
    }
  }, [error]);

  const columns: GridColDef<StoreDetails>[] = useMemo(
    () => [
      { field: 'name', headerName: 'Store Name', width: 150, sortable: true },
      { field: 'pan_no', headerName: 'PAN No', width: 120, sortable: true },
      { field: 'gst_no', headerName: 'GST No', width: 130, sortable: true },
      { field: 'address', headerName: 'Address', width: 180, sortable: true },
      { field: 'city', headerName: 'City', width: 120, sortable: true },
      { field: 'postal_code', headerName: 'Postal Code', width: 120, sortable: true },
      { field: 'state', headerName: 'State', width: 120, sortable: true },
      { field: 'country', headerName: 'Country', width: 120, sortable: true },
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
          Add Store Details
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
