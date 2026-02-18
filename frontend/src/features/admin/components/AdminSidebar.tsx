import React from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Inventory as ProductIcon,
  Category as CategoryIcon,
  LocalOffer as BrandIcon,
  CelebrationOutlined as OccasionIcon,
  ShoppingCart as OrderIcon,
  AssignmentReturn as ReturnIcon,
  SwapHoriz as ExchangeIcon,
  RateReview as ReviewIcon,
  Star as RatingIcon,
  Article as ContentIcon,
  ContactMail as ContactIcon,
} from '@mui/icons-material';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../../config/constants';
import { useLogout } from '../../../features/auth/hooks/useAuth';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', to: ROUTES.ADMIN.HOME, icon: <DashboardIcon /> },
  { label: 'Brands', to: ROUTES.ADMIN.BRANDS, icon: <BrandIcon /> },
  { label: 'Categories', to: ROUTES.ADMIN.CATEGORIES, icon: <CategoryIcon /> },
  { label: 'Occasions', to: ROUTES.ADMIN.OCCASIONS, icon: <OccasionIcon /> },
  { label: 'Product Types', to: ROUTES.ADMIN.PRODUCT_TYPES, icon: <CategoryIcon /> },
  { label: 'Products', to: ROUTES.ADMIN.PRODUCTS, icon: <ProductIcon /> },
  { label: 'Orders', to: ROUTES.ADMIN.ORDERS, icon: <OrderIcon /> },
  { label: 'Returns', to: ROUTES.ADMIN.RETURNS, icon: <ReturnIcon /> },
  { label: 'Exchanges', to: ROUTES.ADMIN.EXCHANGES, icon: <ExchangeIcon /> },
  { label: 'Reviews', to: ROUTES.ADMIN.REVIEWS, icon: <ReviewIcon /> },
  { label: 'Ratings', to: ROUTES.ADMIN.RATINGS, icon: <RatingIcon /> },
  { label: 'Contact Us', to: ROUTES.ADMIN.CONTACT_US, icon: <ContactIcon /> },
  { label: 'Content', to: ROUTES.ADMIN.CONTENT, icon: <ContentIcon /> },
];

const AdminSidebar: React.FC = () => {
  const { mutateAsync: logout } = useLogout();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Box
      component="nav"
      sx={{ width: 260, bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <Typography variant="h6" >Admin</Typography>
      </Box>
      <Divider />
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List>
          {navItems.map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              end={item.to === ROUTES.ADMIN.HOME}
              sx={{ 
                mx: 1,
                mb: 0.5,
                borderRadius: 1,
                '&.active': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': { 
                    color: 'primary.contrastText' 
                  },
                  '& .MuiListItemText-primary': {
                    color: 'primary.contrastText',
                    fontWeight: 600,
                  }
                },
                '&:not(.active):hover': {
                  bgcolor: 'action.hover',
                }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Divider />
      <Box sx={{ p: 2 }}>
        <Button startIcon={<LogoutIcon />} fullWidth variant="outlined" color="error" onClick={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </Button>
      </Box>
    </Box>
  );
};

export default AdminSidebar;
