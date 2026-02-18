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
import { useForgotPasswordVerify } from '../../features/auth/hooks/useAuth';
import type { ForgotPasswordVerify } from '../../features/auth/types/auth';
import { ROUTES, ERROR_MESSAGES, PASSWORD_REGEX } from '../../config/constants';
import { PasswordField } from '../common/PasswordField';

interface ForgotPasswordVerifyFormProps {
  email: string;
  onBack: () => void;
}

export const ForgotPasswordVerifyForm = ({ email, onBack }: ForgotPasswordVerifyFormProps) => {
  const { mutate: verifyReset, isPending } = useForgotPasswordVerify();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, touchedFields },
  } = useForm<ForgotPasswordVerify & { confirm_password: string }>({
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      email,
    },
  });

  const onSubmit = (data: ForgotPasswordVerify & { confirm_password: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirm_password, ...resetData } = data;
    verifyReset(resetData);
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
        onClick={onBack}
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
          Reset Password
        </Typography>

        <Typography
          variant="body2"
          sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}
        >
          Enter the OTP sent to <strong>{email}</strong> and your new password.
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label={
                <Box component="span">
                  OTP <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                </Box>
              }
              type="number"
              fullWidth
              error={touchedFields.otp && !!errors.otp}
              helperText={touchedFields.otp && errors.otp?.message}
              {...register('otp', {
                required: ERROR_MESSAGES.REQUIRED,
                min: {
                  value: 0,
                  message: 'OTP must be a 6-digit number',
                },
                max: {
                  value: 999999,
                  message: 'OTP must be a 6-digit number',
                },
                valueAsNumber: true,
              })}
            />

            <PasswordField
              label="New Password *"
              error={touchedFields.new_password && !!errors.new_password}
              helperText={touchedFields.new_password && errors.new_password?.message}
              {...register('new_password', {
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

            <PasswordField
              label="Confirm Password *"
              error={touchedFields.confirm_password && !!errors.confirm_password}
              helperText={touchedFields.confirm_password && errors.confirm_password?.message}
              {...register('confirm_password', {
                required: ERROR_MESSAGES.REQUIRED,
                validate: (value) => value === getValues('new_password') || 'Passwords do not match',
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
              {isPending ? <CircularProgress size={24} /> : 'Reset Password'}
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
