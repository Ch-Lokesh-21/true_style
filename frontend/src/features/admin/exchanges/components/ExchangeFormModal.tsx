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
import { useExchangeStatuses } from '../hooks/useExchanges';
import type { Exchange, ExchangeUpdate } from '../types';

interface ExchangeFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ExchangeUpdate & { status_id: string }) => void;
  exchange?: Exchange | null;
  isLoading?: boolean;
}

export const ExchangeFormModal: React.FC<ExchangeFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  exchange,
  isLoading,
}) => {
  const { data: statuses } = useExchangeStatuses();

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ExchangeUpdate>({
    defaultValues: {
      exchange_status_id: exchange?.exchange_status_id || '',
    },
  });

  useEffect(() => {
    if (exchange) {
      reset({
        exchange_status_id: exchange.exchange_status_id,
      });
    }
  }, [exchange, reset]);

  const handleFormSubmit = (data: ExchangeUpdate) => {
    // Map exchange_status_id to status_id as required by the prop type
    onSubmit({ ...data, status_id: data.exchange_status_id || data.status_id || '' } as ExchangeUpdate & { status_id: string });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Exchange Status</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth error={!!errors.exchange_status_id}>
              <InputLabel>Exchange Status</InputLabel>
              <Controller
                name="exchange_status_id"
                control={control}
                rules={{ required: 'Status is required' }}
                render={({ field }) => (
                  <Select {...field} label="Exchange Status" disabled={isLoading}>
                    {statuses?.map((status) => (
                      <MenuItem key={status._id} value={status._id}>
                        {status.status}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.exchange_status_id && (
                <FormHelperText>{errors.exchange_status_id.message}</FormHelperText>
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
