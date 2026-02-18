import { Box, Container, Typography, Paper, Skeleton, useTheme, useMediaQuery } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useHowItWorks } from '../hooks/useHomeContent';

export const HowItWorksSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data: steps, isLoading } = useHowItWorks();
  
  // Sort steps by idx
  const sortedSteps = [...(steps || [])].sort((a, b) => a.idx - b.idx);
  
  if (isLoading) {
    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="xl">
          <Skeleton variant="text" width={200} height={50} sx={{ mx: 'auto', mb: 5 }} />
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="rectangular" width={180} height={200} sx={{ borderRadius: 3 }} />
            ))}
          </Box>
        </Container>
      </Box>
    );
  }
  
  if (!sortedSteps.length) {
    return null;
  }
  
  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="xl">
        <Typography
          variant="h4"
          component="h2"
          textAlign="center"
          fontWeight="bold"
          sx={{ mb: 5 }}
        >
          How It Works
        </Typography>
        
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? 3 : 2,
          }}
        >
          {sortedSteps.map((step, index) => (
            <Box
              key={step._id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: isMobile ? 'column' : 'row',
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  textAlign: 'center',
                  borderRadius: 3,
                  minWidth: { xs: 160, md: 180 },
                  minHeight: { xs: 180, md: 200 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.50',
                  transition: 'box-shadow 0.2s',
                  '&:hover': {
                    boxShadow: 2,
                  },
                }}
              >
                {step.image_url && (
                  <Box
                    component="img"
                    src={step.image_url}
                    alt={step.title}
                    sx={{
                      width: { xs: 64, md: 80 },
                      height: { xs: 64, md: 80 },
                      objectFit: 'contain',
                      mb: 2,
                    }}
                  />
                )}
                <Typography
                  variant="caption"
                  color="primary"
                  fontWeight="bold"
                  display="block"
                  sx={{ mb: 0.5, fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                >
                  Step {index + 1}
                </Typography>
                <Typography 
                  variant="body2" 
                  fontWeight="medium"
                  sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
                >
                  {step.title}
                </Typography>
              </Paper>
              
              {/* Arrow between steps */}
              {index < sortedSteps.length - 1 && (
                <ArrowForward
                  sx={{
                    mx: 2,
                    my: isMobile ? 1 : 0,
                    color: 'grey.400',
                    transform: isMobile ? 'rotate(90deg)' : 'none',
                  }}
                />
              )}
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};
