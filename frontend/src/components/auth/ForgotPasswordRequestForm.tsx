import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useForgotPasswordRequest } from '../../features/auth/hooks/useAuth';
import type { ForgotPasswordRequest } from '../../features/auth/types/auth';
import { ROUTES, ERROR_MESSAGES } from '../../config/constants';

interface ForgotPasswordRequestFormProps {
  onSuccess: (email: string) => void;
}

export const ForgotPasswordRequestForm = ({ onSuccess }: ForgotPasswordRequestFormProps) => {
  const { mutate: requestReset, isPending } = useForgotPasswordRequest();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<ForgotPasswordRequest>({
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const onSubmit = (data: ForgotPasswordRequest) => {
    requestReset(data, {
      onSuccess: () => {
        onSuccess(data.email);
      },
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        py: 4,
        position: 'relative',
      }}
    >
      <IconButton
        onClick={() => navigate(ROUTES.LOGIN)}
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          backgroundColor: 'white',
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 4 },
          maxWidth: 450,
          width: '100%',
          mx: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{ mb: 1, textAlign: 'center', fontWeight: 'bold', fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
        >
          Forgot Password
        </Typography>

        <Typography
          variant="body2"
          sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}
        >
          Enter your email address and we'll send you an OTP to reset your password.
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label={
                <Box component="span">
                  Email <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                </Box>
              }
              type="email"
              fullWidth
              error={touchedFields.email && !!errors.email}
              helperText={touchedFields.email && errors.email?.message}
              {...register('email', {
                required: ERROR_MESSAGES.REQUIRED,
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: ERROR_MESSAGES.INVALID_EMAIL,
                },
              })}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isPending}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none',
                fontWeight: 'bold',
              }}
            >
              {isPending ? <CircularProgress size={24} /> : 'Send OTP'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Remember your password?{' '}
                <Button
                  onClick={() => navigate(ROUTES.LOGIN)}
                  sx={{
                    textTransform: 'none',
                    p: 0,
                    minWidth: 'auto',
                    fontWeight: 'bold',
                    verticalAlign: 'baseline',
                  }}
                >
                  Sign In
                </Button>
              </Typography>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};
