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
import { useReviewStatuses } from '../hooks/useReviews';
import type { Review, ReviewFormData } from '../types';

interface ReviewFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ReviewFormData) => void;
  review?: Review | null;
  isLoading?: boolean;
}

export const ReviewFormModal: React.FC<ReviewFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  review,
  isLoading,
}) => {
  const { data: statuses } = useReviewStatuses();

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ReviewFormData>({
    defaultValues: {
      review_status_id: review?.review_status_id || '',
    },
  });

  useEffect(() => {
    if (review) {
      reset({
        review_status_id: review.review_status_id,
      });
    }
  }, [review, reset]);

  const handleFormSubmit = (data: ReviewFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Review Status</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth error={!!errors.review_status_id}>
              <InputLabel>Review Status</InputLabel>
              <Controller
                name="review_status_id"
                control={control}
                rules={{ required: 'Status is required' }}
                render={({ field }) => (
                  <Select {...field} label="Review Status" disabled={isLoading}>
                    {statuses?.map((status) => (
                      <MenuItem key={status._id} value={status._id}>
                        {status.status}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.review_status_id && (
                <FormHelperText>{errors.review_status_id.message}</FormHelperText>
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
