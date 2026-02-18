import React from 'react';
import { Paper, Typography, Box, Skeleton, ToggleButtonGroup, ToggleButton } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useUserGrowth } from '../hooks/useDashboard';

const DAYS_OPTIONS = [7, 14, 30, 90];

export const UserGrowthChart: React.FC = () => {
  const [days, setDays] = React.useState(30);
  const { data, isLoading } = useUserGrowth({ days });

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>
          User Growth
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
          <BarChart data={data?.series ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tickFormatter={(val: string) => val.slice(5)}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              formatter={(val) => [Number(val), 'New Users']}
              labelFormatter={(label) => `Date: ${String(label)}`}
            />
            <Bar dataKey="value" fill="#2e7d32" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};
