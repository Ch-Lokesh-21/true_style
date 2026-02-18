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
  MenuItem,
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
  useHeroImagesList,
  useCreateHeroImage,
  useUpdateHeroImage,
  useDeleteHeroImage,
} from '../hooks/useContent';
import type { HeroImage, HeroImageFormData } from '../types';

const CATEGORY_OPTIONS = ['man', 'women', 'kids', 'ethnic'];

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  item: HeroImage | null;
  mode: 'view' | 'edit' | 'create';
}

const FormModal: React.FC<FormModalProps> = ({ open, onClose, item, mode }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HeroImageFormData>({
    defaultValues: {
      category: item?.category || 'man',
      idx: item?.idx?.toString() || '0',
      image: null,
    },
  });

  const createMutation = useCreateHeroImage();
  const updateMutation = useUpdateHeroImage();
  const isLoading = createMutation.isPending || updateMutation.isPending;
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      reset({
        category: item?.category || 'man',
        idx: item?.idx?.toString() || '0',
        image: null,
      });
      setPreviewImage(null);
    }
  }, [open, item, reset]);

  const onSubmit = async (data: HeroImageFormData) => {
    const payload: Record<string, unknown> = {
      category: data.category,
      idx: parseInt(data.idx, 10),
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
        {mode === 'view' ? 'View' : mode === 'edit' ? 'Edit' : 'Create'} Hero Image (PC)
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              name="category"
              control={control}
              rules={{ required: 'Category is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Category"
                  fullWidth
                  disabled={mode === 'view'}
                  error={!!errors.category}
                  helperText={errors.category?.message}
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
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
                  style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }}
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
  item: HeroImage | null;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ open, onClose, item }) => {
  const deleteMutation = useDeleteHeroImage();

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
        Are you sure you want to delete this hero image? This action cannot be undone.
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

export const HeroImagesContent: React.FC = () => {
  const { data, isLoading, error } = useHeroImagesList();
  
  const items = React.useMemo(() => {
    if (!data) return [];
    if (!Array.isArray(data)) return [];
    return data.filter(item => item._id);
  }, [data]);
  
  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: 'view' | 'edit' | 'create';
    item: HeroImage | null;
  }>({
    open: false,
    mode: 'view',
    item: null,
  });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: HeroImage | null }>({
    open: false,
    item: null,
  });

  React.useEffect(() => {
    if (error) {
      console.error('Error loading hero images:', error);
    }
  }, [error]);

  const columns: GridColDef<HeroImage>[] = useMemo(
    () => [
      { field: 'idx', headerName: 'Order', width: 100, sortable: true },
      { field: 'category', headerName: 'Category', width: 200, sortable: true },
      {
        field: 'image_url',
        headerName: 'Image',
        flex: 1,
        renderCell: (params) => (
          params.value ? (
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <img
                src={params.value}
                alt="Hero"
                style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 4 }}
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
