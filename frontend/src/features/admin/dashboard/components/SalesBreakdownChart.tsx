import React from 'react';
import { Paper, Typography, Box, Skeleton, ToggleButtonGroup, ToggleButton } from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useSalesByCategory, useSalesByBrand } from '../hooks/useDashboard';

const CATEGORY_COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f', '#0288d1', '#558b2f', '#f57c00'];
const BRAND_COLORS = ['#5c6bc0', '#26a69a', '#ef5350', '#ab47bc', '#42a5f5', '#66bb6a', '#ffa726', '#ec407a'];

type ViewMode = 'category' | 'brand';
type ChartType = 'pie' | 'bar';

export const SalesBreakdownChart: React.FC = () => {
  const [view, setView] = React.useState<ViewMode>('category');
  const [chartType, setChartType] = React.useState<ChartType>('pie');

  const { data: categoryData, isLoading: catLoading } = useSalesByCategory();
  const { data: brandData, isLoading: brandLoading } = useSalesByBrand();

  const isLoading = view === 'category' ? catLoading : brandLoading;

  const chartData = React.useMemo(() => {
    if (view === 'category') {
      return (categoryData?.categories ?? []).map((c) => ({
        name: c.category_name,
        value: c.total_revenue,
        orders: c.total_orders,
        quantity: c.total_quantity,
      }));
    }
    return (brandData?.brands ?? []).map((b) => ({
      name: b.brand_name,
      value: b.total_revenue,
      orders: b.total_orders,
      quantity: b.total_quantity,
    }));
  }, [view, categoryData, brandData]);

  const colors = view === 'category' ? CATEGORY_COLORS : BRAND_COLORS;

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
        <Typography variant="h6" fontWeight={600}>
          Sales Breakdown
        </Typography>
        <Box display="flex" gap={1}>
          <ToggleButtonGroup
            size="small"
            value={view}
            exclusive
            onChange={(_, val) => val !== null && setView(val)}
          >
            <ToggleButton value="category">Category</ToggleButton>
            <ToggleButton value="brand">Brand</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup
            size="small"
            value={chartType}
            exclusive
            onChange={(_, val) => val !== null && setChartType(val)}
          >
            <ToggleButton value="pie">Pie</ToggleButton>
            <ToggleButton value="bar">Bar</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {isLoading ? (
        <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 2 }} />
      ) : chartData.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={350}>
          <Typography color="text.secondary">No data available</Typography>
        </Box>
      ) : chartType === 'pie' ? (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={60}
              paddingAngle={2}
              label={({ name, percent }) =>
                `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`
              }
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(val) => `₹${Number(val).toLocaleString()}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tickFormatter={(val: number) => `₹${val.toLocaleString()}`} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(val) => `₹${Number(val).toLocaleString()}`} />
            <Bar dataKey="value" name="Revenue" radius={[0, 4, 4, 0]}>
              {chartData.map((_, index) => (
                <Cell key={index} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};
