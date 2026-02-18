import React from 'react';
import { Paper, Typography, Box, Skeleton, ToggleButtonGroup, ToggleButton } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useSalesSeries } from '../hooks/useDashboard';

const DAYS_OPTIONS = [7, 14, 30, 90];

export const SalesChart: React.FC = () => {
  const [days, setDays] = React.useState(30);
  const { data, isLoading } = useSalesSeries({ days });

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>
          Sales Revenue
        </Typography>
        <ToggleButtonGroup
          size="small"
          value={days}
          exclusive
          onChange={(_, val) => val !== null && setDays(val)}
        >
          {DAYS_OPTIONS.map((d) => (
            <ToggleButton key={d} value={d}>
              {d}d
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      {isLoading ? (
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data?.series ?? []}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1976d2" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tickFormatter={(val: string) => val.slice(5)}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(val: number) => `₹${val.toLocaleString()}`} />
            <Tooltip
              formatter={(val) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
              labelFormatter={(label) => `Date: ${String(label)}`}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#1976d2"
              fill="url(#salesGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};
