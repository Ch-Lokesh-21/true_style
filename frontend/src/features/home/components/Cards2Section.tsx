import { Box, Container, Typography, Card, Skeleton, Grid } from '@mui/material';
import { useCards2 } from '../hooks/useHomeContent';

export const Cards2Section = () => {
  const { data: cards, isLoading } = useCards2();
  
  // Sort cards by idx
  const sortedCards = [...(cards || [])].sort((a, b) => a.idx - b.idx);
  
  if (isLoading) {
    return (
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="xl">
          <Skeleton variant="text" width={300} height={50} sx={{ mx: 'auto', mb: 5 }} />
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 4 }} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }
  
  if (!sortedCards.length) {
    return null;
  }
  
  return (
    <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
      <Container maxWidth="xl">
        <Typography
          variant="h4"
          component="h2"
          textAlign="center"
          fontWeight="bold"
          sx={{ mb: 5 }}
        >
          Why Choose True Style?
        </Typography>
        
        <Grid container spacing={3}>
          {sortedCards.map((card) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card._id}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  borderRadius: 4,
                  bgcolor: 'background.paper',
                  p: { xs: 3, md: 4 },
                  minHeight: 280,
                  transition: 'box-shadow 0.2s',
                  '&:hover': {
                    boxShadow: 2,
                  },
                }}
              >
                {card.image_url && (
                  <Box
                    component="img"
                    src={card.image_url}
                    alt={card.title}
                    sx={{
                      width: { xs: 120, md: 160 },
                      height: { xs: 120, md: 160 },
                      objectFit: 'contain',
                      mb: 3,
                    }}
                  />
                )}
                <Typography 
                  variant="h6" 
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
                >
                  {card.title}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
