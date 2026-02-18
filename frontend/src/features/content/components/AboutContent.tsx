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
  useAboutList,
  useCreateAbout,
  useUpdateAbout,
  useDeleteAbout,
} from '../hooks/useContent';
import type { About, AboutFormData } from '../types';

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  item: About | null;
  mode: 'view' | 'edit' | 'create';
}

const FormModal: React.FC<FormModalProps> = ({ open, onClose, item, mode }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AboutFormData>({
    defaultValues: {
      idx: item?.idx?.toString() || '0',
      description: item?.description || '',
      image: null,
    },
  });

  const createMutation = useCreateAbout();
  const updateMutation = useUpdateAbout();
  const isLoading = createMutation.isPending || updateMutation.isPending;
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      reset({
        idx: item?.idx?.toString() || '0',
        description: item?.description || '',
        image: null,
      });
      setPreviewImage(null);
    }
  }, [open, item, reset]);

  const onSubmit = async (data: AboutFormData) => {
    const payload: Record<string, unknown> = {
      idx: parseInt(data.idx, 10),
      description: data.description,
    };

    if (data.image && data.image.length > 0) {
      payload.image = data.image;
    }

    if (mode === 'create') {
      await createMutation.mutateAsync(payload);
    } else if (mode === 'edit' && item) {
      await updateMutation.mutateAsync({ id: item._id, data: payload });
    }
    onClose();
  };

  const handleImageChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const displayPreview = previewImage || item?.image_url || null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === 'view' ? 'View' : mode === 'edit' ? 'Edit' : 'Create'} About Item
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
                  rows={4}
                  fullWidth
                  disabled={mode === 'view'}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
            {mode !== 'view' && (
              <Controller
                name="image"
                control={control}
                rules={mode === 'create' ? { required: 'Image is required' } : {}}
                render={({ field: { value, onChange, ...field } }) => (
                  <Box>
                    <Button variant="outlined" component="label" fullWidth>
                      {value && value.length > 0 ? 'Change Image' : 'Upload Image'}
                      <input
                        {...field}
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                          onChange(e.target.files);
                          handleImageChange(e.target.files);
                        }}
                      />
                    </Button>
                    {errors.image && (
                      <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                        {errors.image.message}
                      </Box>
                    )}
                  </Box>
                )}
              />
            )}
            {displayPreview && (
              <Box sx={{ mt: 2 }}>
                <img
                  src={displayPreview}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                />
              </Box>
            )}
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
  item: About | null;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ open, onClose, item }) => {
  const deleteMutation = useDeleteAbout();

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
        Are you sure you want to delete this about item? This action cannot be undone.
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

export const AboutContent: React.FC = () => {
  const { data, isLoading, error } = useAboutList();
  
  // Safely handle data with logging
  const items = React.useMemo(() => {
    console.log('About data received:', data);
    if (!data) return [];
    if (!Array.isArray(data)) {
      console.error('About data is not an array:', data);
      return [];
    }
    // Verify all items have _id field
    const validItems = data.filter((item) => {
      if (!item._id) {
        console.error('About item missing _id field:', item);
        return false;
      }
      return true;
    });
    return validItems;
  }, [data]);
  
  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: 'view' | 'edit' | 'create';
    item: About | null;
  }>({
    open: false,
    mode: 'view',
    item: null,
  });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: About | null }>({
    open: false,
    item: null,
  });

  // Show error toast if query fails
  React.useEffect(() => {
    if (error) {
      console.error('Error loading about content:', error);
    }
  }, [error]);

  const columns: GridColDef<About>[] = useMemo(
    () => [
      { field: 'idx', headerName: 'Order', width: 100, sortable: true },
      { field: 'description', headerName: 'Description', flex: 1, sortable: true },
      {
        field: 'image_url',
        headerName: 'Image',
        width: 120,
        renderCell: (params) => (
          params.value ? (
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <img
                src={params.value}
                alt="About"
                style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
              />
            </Box>
          ) : null
        ),
      },
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

  const handleCreateClick = () => {
    setModalState({ open: true, mode: 'create', item: null });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
        >
          Create New
        </Button>
      </Box>
      <Box sx={{ height: 600, width: '100%' }}>
        {error && (
          <Box sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText', mb: 2 }}>
            Error loading data: {error instanceof Error ? error.message : 'Unknown error'}
          </Box>
        )}
        {items.length === 0 && !isLoading && !error && (
          <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
            No data available. Click "Create New" to add items.
          </Box>
        )}
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
