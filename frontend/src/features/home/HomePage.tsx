import { Box } from '@mui/material';
import {
  HeroCarousel,
  Cards1Section,
  Cards2Section,
  HowItWorksSection,
  TestimonialsSection,
  AboutSection,
  ContactUsSection,
  PoliciesSection,
} from './components';

export const HomePage = () => {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <HeroCarousel />
      
      <Cards1Section />
      
      <Cards2Section />
      
      <HowItWorksSection />
      
      <TestimonialsSection />
      
      <AboutSection />
      
      <ContactUsSection />
      
      <PoliciesSection />
    </Box>
  );
};
