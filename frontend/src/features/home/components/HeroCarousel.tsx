import { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, IconButton, useMediaQuery, useTheme, Skeleton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useHeroImages, useHeroImagesMobile } from '../hooks/useHomeContent';
import { ROUTES } from '../../../config/constants';

const CATEGORIES = ['Men', 'Women', 'Ethnic'] as const;

export const HeroCarousel = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { data: desktopImages, isLoading: loadingDesktop } = useHeroImages();
  const { data: mobileImages, isLoading: loadingMobile } = useHeroImagesMobile();
  
  const images = isMobile ? mobileImages : desktopImages;
  const isLoading = isMobile ? loadingMobile : loadingDesktop;
  
  // Create separate image arrays for each category
  const categoryImages = useMemo(() => {
    const sorted = [...(images || [])].sort((a, b) => a.idx - b.idx);
    return CATEGORIES.map(category => ({
      category,
      images: sorted.filter(img => 
        img.category?.toLowerCase() === category.toLowerCase()
      )
    }));
  }, [images]);
  
  return (
    <Box>
      {categoryImages.map(({ category, images: catImages }) => (
        <Box key={category}>
          {/* Carousel for this category */}
          <CategoryCarousel 
            key={`${isMobile ? 'mobile' : 'desktop'}-${category}`}
            sortedImages={catImages} 
            isLoading={isLoading} 
          />
        </Box>
      ))}
    </Box>
  );
};

interface CategoryCarouselProps {
  sortedImages: Array<{ _id: string; category: string; idx: number; image_url: string }>;
  isLoading: boolean;
}

const CategoryCarousel = ({ sortedImages, isLoading }: CategoryCarouselProps) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const nextSlide = useCallback(() => {
    if (sortedImages.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % sortedImages.length);
    }
  }, [sortedImages.length]);
  
  const prevSlide = useCallback(() => {
    if (sortedImages.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length);
    }
  }, [sortedImages.length]);
  
  // Auto-advance carousel
  useEffect(() => {
    if (sortedImages.length <= 1) return;
    
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, sortedImages.length]);
  
  if (isLoading) {
    return (
      <Box sx={{ width: '100%', height: { xs: 200, sm: 300, md: 400, lg: 500 } }}>
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </Box>
    );
  }
  
  if (!sortedImages.length) {
    return null;
  }
  
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: 200, sm: 300, md: 400, lg: 500 },
        overflow: 'hidden',
        bgcolor: 'grey.100',
      }}
    >
      {/* Images */}
      <Box
        sx={{
          display: 'flex',
          transition: 'transform 0.5s ease-in-out',
          transform: `translateX(-${currentIndex * 100}%)`,
          height: '100%',
        }}
      >
        {sortedImages.map((image) => (
          <Box
            key={image._id}
            component="img"
            src={image.image_url}
            alt={image.category}
            onClick={() => navigate(ROUTES.SHOP)}
            sx={{
              minWidth: '100%',
              height: '100%',
              objectFit: 'cover',
              cursor: 'pointer',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          />
        ))}
      </Box>
      
      {/* Navigation Arrows */}
      {sortedImages.length > 1 && (
        <>
          <IconButton
            onClick={prevSlide}
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.95)' },
            }}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            onClick={nextSlide}
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.95)' },
            }}
          >
            <ChevronRight />
          </IconButton>
        </>
      )}
      
      {/* Dots Indicator */}
      {sortedImages.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
          }}
        >
          {sortedImages.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentIndex(index)}
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: index === currentIndex ? 'primary.main' : 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};
