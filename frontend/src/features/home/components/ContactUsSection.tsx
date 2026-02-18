import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { Send } from '@mui/icons-material';
import { useSubmitContactUs } from '../hooks/useHomeContent';
import type { ContactUsCreate } from '../types';

export const ContactUsSection = () => {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { mutate: submitContactUs, isPending } = useSubmitContactUs();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactUsCreate>();
  
  const onSubmit = (data: ContactUsCreate) => {
    submitContactUs(data, {
      onSuccess: () => {
        setSubmitSuccess(true);
        reset();
        setTimeout(() => setSubmitSuccess(false), 5000);
      },
    });
  };
  
  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="sm">
        <Typography
          variant="h4"
          component="h2"
          textAlign="center"
          fontWeight="bold"
          sx={{ mb: 4 }}
        >
          Contact Us
        </Typography>
        
        <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
          {submitSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Thank you for your message! We'll get back to you soon.
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              fullWidth
              label="Name"
              {...register('name', { required: 'Name is required' })}
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={4}
              {...register('message', {
                required: 'Message is required',
                minLength: {
                  value: 10,
                  message: 'Message must be at least 10 characters',
                },
              })}
              error={!!errors.message}
              helperText={errors.message?.message}
              sx={{ mb: 3 }}
            />
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isPending}
              startIcon={isPending ? <CircularProgress size={20} /> : <Send />}
            >
              {isPending ? 'Sending...' : 'Send Message'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
