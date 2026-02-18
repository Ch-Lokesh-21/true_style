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
import { useRegister } from '../../features/auth/hooks/useAuth';
import type { RegisterRequest } from '../../features/auth/types/auth';
import {
  ROUTES,
  ERROR_MESSAGES,
  PASSWORD_REGEX,
  NAME_REGEX,
  PHONE_REGEX,
  COUNTRY_CODE_REGEX,
} from '../../config/constants';
import { PasswordField } from '../common/PasswordField';

export const RegisterForm = () => {
  const { mutate: register, isPending } = useRegister();
  const navigate = useNavigate();

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<RegisterRequest>({
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const onSubmit = (data: RegisterRequest) => {
    register(data);
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
          maxWidth: 600,
          width: '100%',
          mx: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{ mb: 1, textAlign: 'center', fontWeight: 'bold', fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
        >
          Create Account
        </Typography>

        <Typography
          variant="body2"
          sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}
        >
          <Box component="span" sx={{ color: 'error.main', fontWeight: 'bold' }}>*</Box> Required fields
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <TextField
                label={
                  <Box component="span">
                    First Name <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                  </Box>
                }
                fullWidth
                error={touchedFields.first_name && !!errors.first_name}
                helperText={touchedFields.first_name && errors.first_name?.message}
                {...formRegister('first_name', {
                  required: ERROR_MESSAGES.REQUIRED,
                  minLength: {
                    value: 1,
                    message: ERROR_MESSAGES.NAME_LENGTH,
                  },
                  maxLength: {
                    value: 50,
                    message: ERROR_MESSAGES.NAME_LENGTH,
                  },
                  pattern: {
                    value: NAME_REGEX,
                    message: ERROR_MESSAGES.NAME_PATTERN,
                  },
                })}
              />
              <TextField
                label={
                  <Box component="span">
                    Last Name <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                  </Box>
                }
                fullWidth
                error={touchedFields.last_name && !!errors.last_name}
                helperText={touchedFields.last_name && errors.last_name?.message}
                {...formRegister('last_name', {
                  required: ERROR_MESSAGES.REQUIRED,
                  minLength: {
                    value: 1,
                    message: ERROR_MESSAGES.NAME_LENGTH,
                  },
                  maxLength: {
                    value: 50,
                    message: ERROR_MESSAGES.NAME_LENGTH,
                  },
                  pattern: {
                    value: NAME_REGEX,
                    message: ERROR_MESSAGES.NAME_PATTERN,
                  },
                })}
              />
            </Box>

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
              {...formRegister('email', {
                required: ERROR_MESSAGES.REQUIRED,
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: ERROR_MESSAGES.INVALID_EMAIL,
                },
              })}
            />

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <TextField
                label={
                  <Box component="span">
                    Country Code <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                  </Box>
                }
                sx={{ width: { xs: '100%', sm: '140px' } }}
                placeholder="+91"
                error={touchedFields.country_code && !!errors.country_code}
                helperText={touchedFields.country_code && errors.country_code?.message}
                {...formRegister('country_code', {
                  required: ERROR_MESSAGES.REQUIRED,
                  pattern: {
                    value: COUNTRY_CODE_REGEX,
                    message: ERROR_MESSAGES.COUNTRY_CODE_PATTERN,
                  },
                })}
              />
              <TextField
                label={
                  <Box component="span">
                    Phone Number <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                  </Box>
                }
                fullWidth
                error={touchedFields.phone_no && !!errors.phone_no}
                helperText={touchedFields.phone_no && errors.phone_no?.message}
                {...formRegister('phone_no', {
                  required: ERROR_MESSAGES.REQUIRED,
                  pattern: {
                    value: PHONE_REGEX,
                    message: ERROR_MESSAGES.PHONE_PATTERN,
                  },
                })}
              />
            </Box>

            <PasswordField
              label="Password"
              required
              fullWidth
              error={touchedFields.password && !!errors.password}
              helperText={touchedFields.password && errors.password?.message}
              {...formRegister('password', {
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
              {isPending ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>

            <Typography sx={{ textAlign: 'center', mt: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Already have an account?{' '}
              <Link
                to={ROUTES.LOGIN}
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
                  Sign In
                </Box>
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};
