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
import type { Occasion, OccasionCreate, OccasionUpdate } from '../types';

interface OccasionFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: OccasionCreate | OccasionUpdate) => void;
  occasion?: Occasion | null;
  isLoading?: boolean;
}

export const OccasionFormModal: React.FC<OccasionFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  occasion,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OccasionCreate>({
    defaultValues: {
      occasion: occasion?.occasion || '',
    },
  });

  useEffect(() => {
    if (occasion) {
      reset({ occasion: occasion.occasion });
    } else {
      reset({ occasion: '' });
    }
  }, [occasion, reset]);

  const handleFormSubmit = (data: OccasionCreate) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{occasion ? 'Edit Occasion' : 'Create Occasion'}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Occasion Name"
              {...register('occasion', {
                required: 'Occasion name is required',
                minLength: {
                  value: 1,
                  message: 'Occasion name must be at least 1 character',
                },
                maxLength: {
                  value: 120,
                  message: 'Occasion name must not exceed 120 characters',
                },
              })}
              error={!!errors.occasion}
              helperText={errors.occasion?.message}
              disabled={isLoading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {occasion ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
