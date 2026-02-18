import { Box, Container, Typography, Card, CardContent, Skeleton, Grid } from '@mui/material';
import { useAbout } from '../hooks/useHomeContent';

export const AboutSection = () => {
  const { data: aboutItems, isLoading } = useAbout();
  
  // Sort about items by idx
  const sortedAboutItems = [...(aboutItems || [])].sort((a, b) => a.idx - b.idx);
  
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Skeleton variant="text" width={250} height={50} sx={{ mx: 'auto', mb: 4 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid size={{ xs: 12, sm: 6 }} key={i}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }
  
  if (!sortedAboutItems.length) {
    return null;
  }
  
  return (
    <Box sx={{ bgcolor: 'grey.50', py: 6 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h2"
          textAlign="center"
          fontWeight="bold"
          sx={{ mb: 4 }}
        >
          About True Style
        </Typography>
        
        <Grid container spacing={3}>
          {sortedAboutItems.map((item) => (
            <Grid size={{ xs: 12, sm: 6 }} key={item._id}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 2,
                  overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                  {item.image_url && (
                    <Box
                      component="img"
                      src={item.image_url}
                      alt="About True Style"
                      sx={{
                        width: { xs: 80, md: 80 },
                        height: { xs: 80, md: 80 },
                        objectFit: 'cover',
                        m: 2,
                        borderRadius: 1,
                      }}
                    />
                  )}
                  <CardContent sx={{ flex: 1, p: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
