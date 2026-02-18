import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { usePolicies } from '../hooks/useHomeContent';

export const PoliciesSection = () => {
  const { data: policies, isLoading } = usePolicies();
  const [expanded, setExpanded] = useState<string | false>(false);
  
  // Sort policies by idx
  const sortedPolicies = [...(policies || [])].sort((a, b) => a.idx - b.idx);
  
  const handleChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };
  
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Skeleton variant="text" width={200} height={50} sx={{ mx: 'auto', mb: 4 }} />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1 }} />
        ))}
      </Container>
    );
  }
  
  if (!sortedPolicies.length) {
    return null;
  }
  
  return (
    <Box sx={{ bgcolor: 'grey.50', py: 6 }}>
      <Container maxWidth="md">
        <Typography
          variant="h4"
          component="h2"
          textAlign="center"
          fontWeight="bold"
          sx={{ mb: 4 }}
        >
          Policies
        </Typography>
        
        {sortedPolicies.map((policy) => (
          <Accordion
            key={policy._id}
            expanded={expanded === policy._id}
            onChange={handleChange(policy._id)}
            elevation={0}
            sx={{
              mb: 1,
              '&:before': { display: 'none' },
              borderRadius: 1,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'grey.200',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                bgcolor: expanded === policy._id ? 'primary.50' : 'background.paper',
                '&:hover': { bgcolor: 'primary.50' },
              }}
            >
              <Typography fontWeight="medium">{policy.title}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ bgcolor: 'background.paper' }}>
              <Typography variant="body2" color="text.secondary" whiteSpace="pre-line">
                {policy.description}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
};
