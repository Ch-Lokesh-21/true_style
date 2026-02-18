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
  TextField,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useOrderStatuses } from '../hooks/useOrders';
import type { Order, OrderUpdate } from '../types';

interface OrderFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: OrderUpdate & { order_status_id: string }) => void;
  order?: Order | null;
  isLoading?: boolean;
}

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  order,
  isLoading,
}) => {
  const { data: statuses } = useOrderStatuses();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<OrderUpdate>({
    defaultValues: {
      status_id: order?.status_id || '',
      delivery_date: order?.delivery_date || '',
    },
  });

  useEffect(() => {
    if (order) {
      reset({
        status_id: order.status_id,
        delivery_date: order.delivery_date,
      });
    }
  }, [order, reset]);

  const handleFormSubmit = (data: OrderUpdate) => {
    // Map status_id to order_status_id as required by the prop type
    onSubmit({ ...data, order_status_id: data.status_id || data.order_status_id || '' } as OrderUpdate & { order_status_id: string });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Order</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth error={!!errors.status_id}>
              <InputLabel>Order Status</InputLabel>
              <Controller
                name="status_id"
                control={control}
                rules={{ required: 'Status is required' }}
                render={({ field }) => (
                  <Select {...field} label="Order Status" disabled={isLoading}>
                    {statuses?.map((status) => (
                      <MenuItem key={status._id} value={status._id}>
                        {status.status}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.status_id && (
                <FormHelperText>{errors.status_id.message}</FormHelperText>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Delivery Date"
              type="date"
              {...register('delivery_date', { required: 'Delivery date is required' })}
              error={!!errors.delivery_date}
              helperText={errors.delivery_date?.message}
              disabled={isLoading}
              InputLabelProps={{ shrink: true }}
            />
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
