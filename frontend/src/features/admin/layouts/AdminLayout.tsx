import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  Inventory as ProductIcon,
  ShoppingCart as OrderIcon,
  Assignment as BrandIcon,
  Event as OccasionIcon,
  KeyboardReturn as ReturnIcon,
  CompareArrows as ExchangeIcon,
  RateReview as ReviewIcon,
  Star as RatingIcon,
  Info as AboutIcon,
  Help as FAQIcon,
  FormatQuote as TestimonialIcon,
  Image as HeroImageIcon,
  ExpandLess,
  ExpandMore,
  Article as ContentIcon,
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../config/constants';

const drawerWidth = 260;

interface MenuItemType {
  title: string;
  path?: string;
  icon: React.ReactNode;
  children?: MenuItemType[];
}

const menuItems: MenuItemType[] = [
  {
    title: 'Dashboard',
    path: ROUTES.ADMIN.HOME,
    icon: <DashboardIcon />,
  },
  {
    title: 'Product Management',
    icon: <ProductIcon />,
    children: [
      { title: 'Brands', path: ROUTES.ADMIN.BRANDS, icon: <BrandIcon /> },
      { title: 'Categories', path: ROUTES.ADMIN.CATEGORIES, icon: <CategoryIcon /> },
      { title: 'Occasions', path: ROUTES.ADMIN.OCCASIONS, icon: <OccasionIcon /> },
      { title: 'Products', path: ROUTES.ADMIN.PRODUCTS, icon: <ProductIcon /> },
    ],
  },
  {
    title: 'Order Management',
    icon: <OrderIcon />,
    children: [
      { title: 'Orders', path: ROUTES.ADMIN.ORDERS, icon: <OrderIcon /> },
      { title: 'Returns', path: ROUTES.ADMIN.RETURNS, icon: <ReturnIcon /> },
      { title: 'Exchanges', path: ROUTES.ADMIN.EXCHANGES, icon: <ExchangeIcon /> },
    ],
  },
  {
    title: 'Reviews & Ratings',
    icon: <ReviewIcon />,
    children: [
      { title: 'Reviews', path: ROUTES.ADMIN.REVIEWS, icon: <ReviewIcon /> },
      { title: 'Ratings', path: ROUTES.ADMIN.RATINGS, icon: <RatingIcon /> },
    ],
  },
  {
    title: 'Content Management',
    icon: <ContentIcon />,
    children: [
      { title: 'About', path: ROUTES.ADMIN.CONTENT_ABOUT, icon: <AboutIcon /> },
      { title: 'FAQ', path: ROUTES.ADMIN.CONTENT_FAQ, icon: <FAQIcon /> },
      { title: 'Testimonials', path: ROUTES.ADMIN.CONTENT_TESTIMONIALS, icon: <TestimonialIcon /> },
      { title: 'Hero Images', path: ROUTES.ADMIN.CONTENT_HERO_IMAGES, icon: <HeroImageIcon /> },
    ],
  },
];

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (item: MenuItemType) => {
    if (item.children) {
      setOpenMenus((prev) => ({
        ...prev,
        [item.title]: !prev[item.title],
      }));
    } else if (item.path) {
      navigate(item.path);
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Admin Panel
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <React.Fragment key={item.title}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleMenuClick(item)}
                selected={item.path === location.pathname}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.title} />
                {item.children && (openMenus[item.title] ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
            </ListItem>
            {item.children && (
              <Collapse in={openMenus[item.title]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItemButton
                      key={child.title}
                      sx={{ pl: 4 }}
                      onClick={() => handleMenuClick(child)}
                      selected={child.path === location.pathname}
                    >
                      <ListItemIcon>{child.icon}</ListItemIcon>
                      <ListItemText primary={child.title} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="admin menu"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};
