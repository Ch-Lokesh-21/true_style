import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import { Close, Login } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../../../config/constants';

interface LoginRequiredModalProps {
  open: boolean;
  onClose: () => void;
  message?: string;
  action?: string;
}

export const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({
  open,
  onClose,
  message = 'Please login to continue',
  action = 'this action',
}) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate(ROUTES.LOGIN);
  };

  const handleRegister = () => {
    onClose();
    navigate(ROUTES.REGISTER);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Login Required</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Login sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {message}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You need to be logged in to {action}.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, flexDirection: 'column', gap: 1 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleLogin}
          size="large"
          sx={{
            backgroundColor: '#000',
            '&:hover': { backgroundColor: '#333' },
            textTransform: 'none',
          }}
        >
          Login
        </Button>
        <Button
          variant="outlined"
          fullWidth
          onClick={handleRegister}
          size="large"
          sx={{
            borderColor: '#000',
            color: '#000',
            textTransform: 'none',
            '&:hover': { borderColor: '#333', backgroundColor: 'transparent' },
          }}
        >
          Create Account
        </Button>
        <Button
          onClick={onClose}
          sx={{ textTransform: 'none', color: 'text.secondary', mt: 1 }}
        >
          Continue Browsing
        </Button>
      </DialogActions>
    </Dialog>
  );
};
