import React from 'react';
import { Paper, Typography, Box, Skeleton, Chip, Divider } from '@mui/material';
import {
  CheckCircle as HealthyIcon,
  Error as ErrorIcon,
  Backup as BackupIcon,
} from '@mui/icons-material';
import { useSystemHealth } from '../hooks/useDashboard';

export const SystemHealthPanel: React.FC = () => {
  const { data, isLoading } = useSystemHealth();

  if (isLoading) {
    return (
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Skeleton height={32} width={200} sx={{ mb: 2 }} />
        <Skeleton height={100} />
      </Paper>
    );
  }

  const hasIssues = (data?.failed_backups_7d ?? 0) > 0 || (data?.failed_restores_7d ?? 0) > 0;

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <BackupIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          System Health
        </Typography>
        <Chip
          icon={hasIssues ? <ErrorIcon /> : <HealthyIcon />}
          label={hasIssues ? 'Issues Detected' : 'Healthy'}
          size="small"
          color={hasIssues ? 'error' : 'success'}
        />
      </Box>

      <Box display="flex" gap={3} flexWrap="wrap" mb={2}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Failed Backups (7d)
          </Typography>
          <Typography variant="h5" fontWeight={600} color={data?.failed_backups_7d ? 'error.main' : 'success.main'}>
            {data?.failed_backups_7d ?? 0}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Failed Restores (7d)
          </Typography>
          <Typography variant="h5" fontWeight={600} color={data?.failed_restores_7d ? 'error.main' : 'success.main'}>
            {data?.failed_restores_7d ?? 0}
          </Typography>
        </Box>
      </Box>

      {data?.last_backup && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" fontWeight={600} mb={1}>
            Last Backup
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip label={`Status: ${data.last_backup.status}`} size="small" variant="outlined" />
            {data.last_backup.scope && (
              <Chip label={`Scope: ${data.last_backup.scope}`} size="small" variant="outlined" />
            )}
            {data.last_backup.frequency && (
              <Chip label={`Freq: ${data.last_backup.frequency}`} size="small" variant="outlined" />
            )}
            {data.last_backup.size != null && (
              <Chip label={`Size: ${data.last_backup.size.toFixed(2)} MB`} size="small" variant="outlined" />
            )}
          </Box>
          {data.last_backup.finished_at && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              Finished: {new Date(data.last_backup.finished_at).toLocaleString()}
            </Typography>
          )}
        </>
      )}
    </Paper>
  );
};
