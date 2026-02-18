import { Box, Container, Typography, Card, CardContent, Avatar, Skeleton, Grid } from '@mui/material';
import { FormatQuote } from '@mui/icons-material';
import { useTestimonials } from '../hooks/useHomeContent';

export const TestimonialsSection = () => {
  const { data: testimonials, isLoading } = useTestimonials();
  
  // Sort testimonials by idx
  const sortedTestimonials = [...(testimonials || [])].sort((a, b) => a.idx - b.idx);
  
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Skeleton variant="text" width={300} height={50} sx={{ mx: 'auto', mb: 4 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Skeleton variant="rectangular" height={250} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }
  
  if (!sortedTestimonials.length) {
    return null;
  }
  
  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h2"
          textAlign="center"
          fontWeight="bold"
          sx={{ mb: 4 }}
        >
          What Our Customers Say
        </Typography>
        
        <Grid container spacing={3}>
          {sortedTestimonials.map((testimonial) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={testimonial._id}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <FormatQuote
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      color: 'primary.light',
                      fontSize: 40,
                      opacity: 0.3,
                    }}
                  />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={testimonial.image_url}
                      alt="Customer"
                      sx={{ width: 48, height: 48, mr: 2 }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    "{testimonial.description}"
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
