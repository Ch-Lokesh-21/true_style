import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  Skeleton,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Edit,
  Save,
  Cancel,
  PhotoCamera,
} from '@mui/icons-material';
import { useGetProfile, useUpdateProfile } from '../../../auth/hooks/useAuth';

export const ProfilePage: React.FC = () => {
  const { data: profile, isLoading, refetch } = useGetProfile();
  const updateProfile = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    country_code: '',
    phone_no: '',
  });

  // Sync form data with fetched profile
  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        country_code: profile.country_code || '',
        phone_no: profile.phone_no || '',
      });
    }
  }, [profile]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setImageFile(null);
    setImagePreview(null);
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        country_code: profile.country_code || '',
        phone_no: profile.phone_no || '',
      });
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const form = new FormData();
    
    // Only append changed fields
    if (formData.first_name && formData.first_name !== profile?.first_name) {
      form.append('first_name', formData.first_name);
    }
    if (formData.last_name && formData.last_name !== profile?.last_name) {
      form.append('last_name', formData.last_name);
    }
    if (formData.country_code && formData.country_code !== profile?.country_code) {
      form.append('country_code', formData.country_code);
    }
    if (formData.phone_no && formData.phone_no !== profile?.phone_no) {
      form.append('phone_no', formData.phone_no);
    }
    if (imageFile) {
      form.append('image', imageFile);
    }
    
    updateProfile.mutate(form, {
      onSuccess: () => {
        setIsEditing(false);
        setImageFile(null);
        setImagePreview(null);
        refetch();
      },
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f9f9f9', py: 4 }}>
        <Container maxWidth="md">
          <Skeleton variant="text" width={200} height={50} sx={{ mb: 4 }} />
          <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Skeleton variant="circular" width={80} height={80} sx={{ mr: 3 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton variant="text" width={200} height={30} />
                <Skeleton variant="text" width={150} height={20} />
              </Box>
            </Box>
            <Divider sx={{ mb: 4 }} />
            <Skeleton variant="rectangular" height={400} />
          </Paper>
        </Container>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f9f9f9', py: 4 }}>
        <Container maxWidth="md">
          <Typography variant="h6">Profile not found</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9f9f9', py: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>
          My Profile
        </Typography>

        <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #eee' }}>
          {/* Profile Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={imagePreview || profile.profile_img_url || undefined}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  mr: 3,
                }}
              >
                {!imagePreview && !profile.profile_img_url && profile.first_name?.charAt(0).toUpperCase()}
              </Avatar>
              {isEditing && (
                <>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="profile-image-upload"
                    type="file"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="profile-image-upload">
                    <IconButton
                      component="span"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 24,
                        bgcolor: 'background.paper',
                        border: '1px solid #ddd',
                        '&:hover': { bgcolor: 'grey.100' },
                      }}
                    >
                      <PhotoCamera fontSize="small" />
                    </IconButton>
                  </label>
                </>
              )}
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {profile.first_name} {profile.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profile.email}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            {!isEditing ? (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={handleEdit}
                sx={{ borderRadius: 2 }}
              >
                Edit Profile
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  disabled={updateProfile.isPending}
                  sx={{ borderRadius: 2 }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={updateProfile.isPending ? <CircularProgress size={20} color="inherit" /> : <Save />}
                  onClick={handleSave}
                  disabled={updateProfile.isPending}
                  sx={{ borderRadius: 2, bgcolor: '#000', '&:hover': { bgcolor: '#333' } }}
                >
                  {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            )}
          </Box>

          {/* Profile Information */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="First Name"
                fullWidth
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Last Name"
                fullWidth
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                disabled
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                  },
                }}
              />
              {!isEditing && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Email cannot be changed
                </Typography>
              )}
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Country Code"
                fullWidth
                value={formData.country_code}
                onChange={(e) => handleChange('country_code', e.target.value)}
                disabled={!isEditing}
                placeholder="+1, +91, etc."
                sx={{
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Mobile Number"
                fullWidth
                value={formData.phone_no}
                onChange={(e) => handleChange('phone_no', e.target.value)}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                  },
                }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Account Information */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Account Information
          </Typography>
          
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                User ID
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {profile?._id?.slice(-8).toUpperCase() || 'N/A'}
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Account Status
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, color: 'success.main' }}>
                Active
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Member Since
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {profile?.createdAt 
                  ? new Date(profile.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'N/A'
                }
              </Typography>
            </Grid>
          </Grid>

        </Paper>
      </Container>
    </Box>
  );
};
