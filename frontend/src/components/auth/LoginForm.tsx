import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { useLogin } from '../../features/auth/hooks/useAuth';
import type { LoginRequest } from '../../features/auth/types/auth';
import { ROUTES, ERROR_MESSAGES, PASSWORD_REGEX } from '../../config/constants';
import { PasswordField } from '../common/PasswordField';

export const LoginForm = () => {
  const { mutate: login, isPending } = useLogin();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<LoginRequest>({
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const onSubmit = (data: LoginRequest) => {
    login(data);
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
        onClick={() => navigate(ROUTES.HOME)}
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
        <HomeIcon />
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
          Sign In
        </Typography>

        <Typography
          variant="body2"
          sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}
        >
          <Box component="span" sx={{ color: 'error.main', fontWeight: 'bold' }}>*</Box> Required fields
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

            <PasswordField
              label="Password"
              required
              fullWidth
              error={touchedFields.password && !!errors.password}
              helperText={touchedFields.password && errors.password?.message}
              {...register('password', {
                required: ERROR_MESSAGES.REQUIRED,
                minLength: {
                  value: 8,
                  message: ERROR_MESSAGES.PASSWORD_MIN,
                },
                pattern: {
                  value: PASSWORD_REGEX,
                  message: ERROR_MESSAGES.PASSWORD_PATTERN,
                },
              })}
            />

            <Box sx={{ textAlign: 'right' }}>
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                style={{
                  color: '#1976d2',
                  textDecoration: 'none',
                  fontSize: '14px',
                }}
              >
                <Box
                  component="span"
                  sx={{
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Forgot Password?
                </Box>
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isPending}
              sx={{
                py: 1.5,
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: 'bold',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {isPending ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>

            <Typography sx={{ textAlign: 'center', mt: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Don&apos;t have an account?{' '}
              <Link
                to={ROUTES.REGISTER}
                style={{
                  color: '#1976d2',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                }}
              >
                <Box
                  component="span"
                  sx={{
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign Up
                </Box>
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};
