import React from 'react';
import { Box, Typography, Tabs, Tab, Grid, Divider, Collapse, IconButton } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingIcon,
  ShoppingCart as OrderIcon,
  Inventory as InventoryIcon,
  MonitorHeart as HealthIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
  Store as BrandIcon,
  LocalShipping as ShippingIcon,
  SwapHoriz as ExchangeIcon,
  AssignmentReturn as ReturnIcon,
  ProductionQuantityLimits as OutOfStockIcon,
  CheckCircle as CompletedIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

import { StatCard } from './StatCard';
import { SalesChart } from './SalesChart';
import { UserGrowthChart } from './UserGrowthChart';
import { SalesBreakdownChart } from './SalesBreakdownChart';
import { RecentOrdersTable } from './RecentOrdersTable';
import { PendingWorkPanel } from './PendingWorkPanel';
import { TopProductsTable } from './TopProductsTable';
import { LowStockTable } from './LowStockTable';
import { SystemHealthPanel } from './SystemHealthPanel';
import { useAdminOverview } from '../hooks/useDashboard';

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
    {value === index && children}
  </Box>
);

export const AdminDashboard: React.FC = () => {
  const [tab, setTab] = React.useState(0);
  const [metricsOpen, setMetricsOpen] = React.useState(true);
  const { data: adminOverview, isLoading } = useAdminOverview();

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of your store performance and key metrics
        </Typography>
      </Box>

      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ cursor: 'pointer', mb: 1 }}
        onClick={() => setMetricsOpen((prev) => !prev)}
      >
        <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
          Key Metrics
        </Typography>
        <IconButton size="small">
          {metricsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={metricsOpen} timeout="auto">
        <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatCard
            title="Total Earnings"
            value={adminOverview ? `₹${adminOverview.total_earnings.toLocaleString()}` : '₹0'}
            icon={<MoneyIcon />}
            color="#1976d2"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatCard
            title="Total Orders"
            value={adminOverview?.total_orders ?? 0}
            icon={<OrderIcon />}
            color="#2e7d32"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatCard
            title="Total Users"
            value={adminOverview?.total_users ?? 0}
            icon={<PeopleIcon />}
            color="#9c27b0"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatCard
            title="Total Products"
            value={adminOverview?.total_products ?? 0}
            icon={<InventoryIcon />}
            color="#0288d1"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatCard
            title="Pending Orders"
            value={adminOverview?.pending_orders ?? 0}
            icon={<ShippingIcon />}
            color="#ed6c02"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatCard
            title="Pending Returns"
            value={adminOverview?.pending_returns ?? 0}
            icon={<ReturnIcon />}
            color="#d32f2f"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatCard
            title="Pending Exchanges"
            value={adminOverview?.pending_exchanges ?? 0}
            icon={<ExchangeIcon />}
            color="#f57c00"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatCard
            title="Completed Orders"
            value={adminOverview?.completed_orders ?? 0}
            icon={<CompletedIcon />}
            color="#388e3c"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatCard
            title="Categories"
            value={adminOverview?.total_categories ?? 0}
            icon={<CategoryIcon />}
            color="#5c6bc0"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatCard
            title="Brands"
            value={adminOverview?.total_brands ?? 0}
            icon={<BrandIcon />}
            color="#26a69a"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatCard
            title="Out of Stock"
            value={adminOverview?.out_of_stock_products ?? 0}
            icon={<OutOfStockIcon />}
            color={adminOverview?.out_of_stock_products ? '#d32f2f' : '#4caf50'}
            loading={isLoading}
          />
        </Grid>
        </Grid>
      </Collapse>

      <Divider sx={{ mb: 1 }} />

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<DashboardIcon />} label="Overview" iconPosition="start" />
        <Tab icon={<TrendingIcon />} label="Analytics" iconPosition="start" />
        <Tab icon={<OrderIcon />} label="Orders & Work" iconPosition="start" />
        <Tab icon={<InventoryIcon />} label="Inventory" iconPosition="start" />
        <Tab icon={<HealthIcon />} label="System" iconPosition="start" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <SalesChart />
          </Grid>
          <Grid size={{ xs: 12, lg: 5 }}>
            <UserGrowthChart />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <SalesBreakdownChart />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <SalesChart />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <UserGrowthChart />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <SalesBreakdownChart />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <RecentOrdersTable />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <PendingWorkPanel />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={3}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <TopProductsTable />
          </Grid>
          <Grid size={{ xs: 12, lg: 5 }}>
            <LowStockTable />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={4}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <SystemHealthPanel />
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};
