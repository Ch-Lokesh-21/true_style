import React from 'react';
import { Box } from '@mui/material';
import AdminSidebar from './components/AdminSidebar';
import { Outlet } from 'react-router-dom';

export const AdminLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AdminSidebar />
      <Box component="main" sx={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
