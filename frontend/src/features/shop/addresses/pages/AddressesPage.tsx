import React, { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Skeleton,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  LocationOn,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../app/store';
import { useAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress } from '../hooks/useAddresses';
import { ROUTES } from '../../../../config/constants';
import type { UserAddress, UserAddressForm } from '../types';

// Address Form Dialog
const AddressFormDialog: React.FC<{
  open: boolean;
  address?: UserAddress | null;
  onClose: () => void;
  onSubmit: (data: Partial<UserAddress>) => void;
}> = ({ open, address, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    mobile_no: address?.mobile_no || '',
    address: address?.address || '',
    city: address?.city || '',
    state: address?.state || '',
    postal_code: address?.postal_code || 0,
    country: address?.country || 'India',
  });

  React.useEffect(() => {
    if (address) {
      setForm({
        mobile_no: address.mobile_no || '',
        address: address.address || '',
        city: address.city || '',
        state: address.state ||'',
        postal_code: address.postal_code || 0,
        country: address.country || 'India',
      });
    } else {
      setForm({
        mobile_no: '',
        address: '',
        city: '',
        state: '',
        postal_code: 0,
        country: 'India',
      });
    }
  }, [address]);

  const handleSubmit = () => {
    if (form.mobile_no && form.address && form.city && form.state && form.postal_code) {
      onSubmit(form);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{address ? 'Edit Address' : 'Add New Address'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Mobile Number"
            required
            fullWidth
            value={form.mobile_no}
            onChange={(e) => setForm({ ...form, mobile_no: e.target.value })}
            placeholder="10-digit mobile number"
            inputProps={{ maxLength: 10 }}
            InputProps={{ sx: { borderRadius: 0 } }}
          />

          <TextField
            label="Address"
            required
            fullWidth
            multiline
            rows={3}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="House No., Street, Area, Landmark"
            InputProps={{ sx: { borderRadius: 0 } }}
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="City"
                required
                fullWidth
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                InputProps={{ sx: { borderRadius: 0 } }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="State"
                required
                fullWidth
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                InputProps={{ sx: { borderRadius: 0 } }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Postal Code"
                required
                fullWidth
                type="number"
                value={form.postal_code}
                onChange={(e) => setForm({ ...form, postal_code: parseInt(e.target.value) || 0 })}
                inputProps={{ maxLength: 6 }}
                InputProps={{ sx: { borderRadius: 0 } }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Country"
                required
                fullWidth
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                InputProps={{ sx: { borderRadius: 0 } }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!form.mobile_no || !form.address || !form.city || !form.state || !form.postal_code}
          sx={{ backgroundColor: '#000' }}
        >
          {address ? 'Update' : 'Add'} Address
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Address Card Component
const AddressCard: React.FC<{
  address: UserAddress;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ address, onEdit, onDelete }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        position: 'relative',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <LocationOn sx={{ color: 'text.secondary', mt: 0.5 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body1">{address.address}</Typography>
          <Typography variant="body2">
            {address.city}, {address.state} - {address.postal_code}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {address.country}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Mobile: {address.mobile_no}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
        <IconButton size="small" onClick={onEdit}>
          <Edit fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={onDelete} color="error">
          <Delete fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
};

// Delete Confirmation Dialog
const DeleteConfirmDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Address</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to delete this address?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" onClick={onConfirm}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const AddressesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  // Auth state
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Local state
  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    address: UserAddress | null;
  }>({
    open: false,
    address: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    addressId: string;
  }>({
    open: false,
    addressId: '',
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch data
  const { data: addresses, isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  // Handlers
  const handleAddClick = useCallback(() => {
    setFormDialog({ open: true, address: null });
  }, []);

  const handleEditClick = useCallback((address: UserAddress) => {
    setFormDialog({ open: true, address });
  }, []);

  const handleDeleteClick = useCallback((addressId: string) => {
    setDeleteDialog({ open: true, addressId });
  }, []);

  const handleFormSubmit = useCallback(
    (data: Partial<UserAddress>) => {
      if (formDialog.address?._id) {
        // Update existing
        updateAddress.mutate(
          { id: formDialog.address._id, data },
          {
            onSuccess: () => {
              setSnackbar({
                open: true,
                message: 'Address updated successfully',
                severity: 'success',
              });
              setFormDialog({ open: false, address: null });
              
              // Redirect if needed
              if (redirectTo === 'checkout') {
                navigate('/checkout');
              }
            },
            onError: () => {
              setSnackbar({
                open: true,
                message: 'Failed to update address',
                severity: 'error',
              });
            },
          }
        );
      } else {
        // Create new
        createAddress.mutate(data as UserAddressForm, {
          onSuccess: () => {
            setSnackbar({
              open: true,
              message: 'Address added successfully',
              severity: 'success',
            });
            setFormDialog({ open: false, address: null });
            
            // Redirect if needed
            if (redirectTo === 'checkout') {
              navigate('/checkout');
            }
          },
          onError: () => {
            setSnackbar({
              open: true,
              message: 'Failed to add address',
              severity: 'error',
            });
          },
        });
      }
    },
    [formDialog.address, createAddress, updateAddress, navigate, redirectTo]
  );

  const handleDeleteConfirm = useCallback(() => {
    deleteAddress.mutate(deleteDialog.addressId, {
      onSuccess: () => {
        setSnackbar({
          open: true,
          message: 'Address deleted successfully',
          severity: 'success',
        });
        setDeleteDialog({ open: false, addressId: '' });
      },
      onError: () => {
        setSnackbar({
          open: true,
          message: 'Failed to delete address',
          severity: 'error',
        });
      },
    });
  }, [deleteDialog.addressId, deleteAddress]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <LocationOn sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Please login to manage your addresses
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate(ROUTES.LOGIN)}
          sx={{ mt: 2, backgroundColor: '#000' }}
        >
          Login
        </Button>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          {[...Array(2)].map((_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6 }}>
              <Skeleton variant="rectangular" height={150} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9f9f9' }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            My Addresses
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddClick}
            sx={{
              backgroundColor: '#000',
              borderRadius: 0,
              textTransform: 'none',
            }}
          >
            Add New Address
          </Button>
        </Box>

        {addresses && addresses.length > 0 ? (
          <Grid container spacing={2}>
            {addresses.map((address) => (
              <Grid key={address._id} size={{ xs: 12, sm: 6 }}>
                <AddressCard
                  address={address}
                  onEdit={() => handleEditClick(address)}
                  onDelete={() => address._id && handleDeleteClick(address._id)}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 0,
            }}
          >
            <LocationOn sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No addresses saved
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Add an address for faster checkout
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddClick}
              sx={{ backgroundColor: '#000', borderRadius: 0 }}
            >
              Add Address
            </Button>
          </Paper>
        )}
      </Container>

      {/* Form Dialog */}
      <AddressFormDialog
        open={formDialog.open}
        address={formDialog.address}
        onClose={() => setFormDialog({ open: false, address: null })}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, addressId: '' })}
        onConfirm={handleDeleteConfirm}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
