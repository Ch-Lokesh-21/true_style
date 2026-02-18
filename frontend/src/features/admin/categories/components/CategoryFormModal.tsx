import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import type { Category, CategoryCreate, CategoryUpdate } from '../types';

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryCreate | CategoryUpdate) => void;
  category?: Category | null;
  isLoading?: boolean;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  category,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryCreate>({
    defaultValues: {
      category: category?.category || '',
    },
  });

  useEffect(() => {
    if (category) {
      reset({ category: category.category });
    } else {
      reset({ category: '' });
    }
  }, [category, reset]);

  const handleFormSubmit = (data: CategoryCreate) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{category ? 'Edit Category' : 'Create Category'}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Category Name"
              {...register('category', {
                required: 'Category name is required',
                minLength: {
                  value: 1,
                  message: 'Category name must be at least 1 character',
                },
                maxLength: {
                  value: 120,
                  message: 'Category name must not exceed 120 characters',
                },
              })}
              error={!!errors.category}
              helperText={errors.category?.message}
              disabled={isLoading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {category ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
