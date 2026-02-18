import {
  Box,
  Container,
  Typography,
  Grid,
  Divider,
  Skeleton,
} from '@mui/material';
import {
  LocationOn,
} from '@mui/icons-material';
import { useStoreDetails } from '../hooks/useHomeContent';

export const Footer = () => {
  const { data: storeDetails, isLoading } = useStoreDetails();
  
  // Get the first store details entry
  const store = storeDetails?.[0];
  
  if (isLoading) {
    return (
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {[1, 2, 3].map((i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Skeleton variant="rectangular" height={150} sx={{ bgcolor: 'grey.800' }} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }
  
  return (
    <Box sx={{ bgcolor: 'grey.900', color: 'white' }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Store Info */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {store?.name || 'True Style'}
            </Typography>
            <Typography variant="body2" color="grey.400" sx={{ mb: 2 }}>
              Your trusted destination for quality fashion.
            </Typography>
          </Grid>
          
          {/* Contact Info */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Address
            </Typography>
            
            {store?.address && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <LocationOn sx={{ color: 'grey.400', mr: 1, fontSize: 20, mt: 0.3 }} />
                <Typography variant="body2" color="grey.400">
                  {store.address}
                  {store.city && `, ${store.city}`}
                  {store.state && `, ${store.state}`}
                  {store.postal_code && ` - ${store.postal_code}`}
                  {store.country && `, ${store.country}`}
                </Typography>
              </Box>
            )}
          </Grid>
          
          {/* Business Details */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Business Details
            </Typography>
            
            {store?.gst_no && (
              <Typography variant="body2" color="grey.400" sx={{ mb: 1 }}>
                <strong>GST:</strong> {store.gst_no}
              </Typography>
            )}
            {store?.pan_no && (
              <Typography variant="body2" color="grey.400">
                <strong>PAN:</strong> {store.pan_no}
              </Typography>
            )}
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4, borderColor: 'grey.700' }} />
        
        {/* Copyright */}
        <Typography variant="body2" color="grey.500" textAlign="center">
          © {new Date().getFullYear()} {store?.name || 'True Style'}. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};
