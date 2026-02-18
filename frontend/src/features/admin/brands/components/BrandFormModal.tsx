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
import type { Brand, BrandCreate, BrandUpdate } from '../types';

interface BrandFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BrandCreate | BrandUpdate) => void;
  brand?: Brand | null;
  isLoading?: boolean;
}

export const BrandFormModal: React.FC<BrandFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  brand,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BrandCreate>({
    defaultValues: {
      name: brand?.name || '',
    },
  });

  useEffect(() => {
    if (brand) {
      reset({ name: brand.name });
    } else {
      reset({ name: '' });
    }
  }, [brand, reset]);

  const handleFormSubmit = (data: BrandCreate) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{brand ? 'Edit Brand' : 'Create Brand'}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Brand Name"
              {...register('name', {
                required: 'Brand name is required',
                minLength: {
                  value: 1,
                  message: 'Brand name must be at least 1 character',
                },
                maxLength: {
                  value: 120,
                  message: 'Brand name must not exceed 120 characters',
                },
              })}
              error={!!errors.name}
              helperText={errors.name?.message}
              disabled={isLoading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {brand ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
