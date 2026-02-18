import { Box, Typography } from '@mui/material';

export const AdminHomePage = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" sx={{ mb: 2 }}>
        Admin Dashboard
      </Typography>
      <Typography color="text.secondary">Welcome to the admin panel</Typography>
    </Box>
  );
};
