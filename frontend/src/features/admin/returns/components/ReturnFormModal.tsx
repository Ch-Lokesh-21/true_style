import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useReturnStatuses } from '../hooks/useReturns';
import type { Return, ReturnUpdate } from '../types';

interface ReturnFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ReturnUpdate & { return_status_id: string }) => void;
  returnItem?: Return | null;
  isLoading?: boolean;
}

export const ReturnFormModal: React.FC<ReturnFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  returnItem,
  isLoading,
}) => {
  const { data: statuses } = useReturnStatuses();

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ReturnUpdate>({
    defaultValues: {
      return_status_id: returnItem?.return_status_id || '',
    },
  });

  useEffect(() => {
    if (returnItem) {
      reset({
        return_status_id: returnItem.return_status_id,
      });
    }
  }, [returnItem, reset]);

  const handleFormSubmit = (data: ReturnUpdate) => {
    // Ensure return_status_id is present as required by the prop type
    onSubmit(data as ReturnUpdate & { return_status_id: string });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Return Status</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth error={!!errors.return_status_id}>
              <InputLabel>Return Status</InputLabel>
              <Controller
                name="return_status_id"
                control={control}
                rules={{ required: 'Status is required' }}
                render={({ field }) => (
                  <Select {...field} label="Return Status" disabled={isLoading}>
                    {statuses?.map((status) => (
                      <MenuItem key={status._id} value={status._id}>
                        {status.status}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.return_status_id && (
                <FormHelperText>{errors.return_status_id.message}</FormHelperText>
              )}
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            Update
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
