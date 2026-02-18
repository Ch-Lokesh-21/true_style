import React from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
} from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../config/constants';

const contentTabs = [
  { label: 'About', path: ROUTES.ADMIN.CONTENT_ABOUT },
  { label: 'FAQ', path: ROUTES.ADMIN.CONTENT_FAQ },
  { label: 'Hero Images (PC)', path: ROUTES.ADMIN.CONTENT_HERO_IMAGES },
  { label: 'Hero Images (Mobile)', path: ROUTES.ADMIN.CONTENT_HERO_IMAGES_MOBILE },
  { label: 'Testimonials', path: ROUTES.ADMIN.CONTENT_TESTIMONIALS },
  { label: 'Terms & Conditions', path: ROUTES.ADMIN.CONTENT_TERMS },
  { label: 'Policies', path: ROUTES.ADMIN.CONTENT_POLICIES },
  { label: 'How It Works', path: ROUTES.ADMIN.CONTENT_HOW_IT_WORKS },
  { label: 'Store Details', path: ROUTES.ADMIN.CONTENT_STORE_DETAILS },
  { label: 'Cards 1', path: ROUTES.ADMIN.CONTENT_CARDS_1 },
  { label: 'Cards 2', path: ROUTES.ADMIN.CONTENT_CARDS_2 },
];

export const ContentLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab based on current path
  const activeTab = contentTabs.findIndex(tab => location.pathname === tab.path);
  const currentTab = activeTab >= 0 ? activeTab : 0;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    navigate(contentTabs[newValue].path);
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ mb: 2 }}>
        <Box sx={{ px: 3, pt: 3, pb: 1 }}>
          <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', textAlign: 'center' }}>
            Content Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2}}>
            Manage all website content from here
          </Typography>
        </Box>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {contentTabs.map((tab) => (
            <Tab key={tab.path} label={tab.label} />
          ))}
        </Tabs>
      </Paper>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </Box>
    </Box>
  );
};
