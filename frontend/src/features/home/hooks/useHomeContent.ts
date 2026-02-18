import { useQuery, useMutation } from '@tanstack/react-query';
import { homeContentService } from '../services/homeContentService';
import type { ContactUsCreate } from '../types';
import { toast } from 'react-toastify';

// Hero Images (Desktop)
export const useHeroImages = () => {
  return useQuery({
    queryKey: ['hero-images'],
    queryFn: homeContentService.getHeroImages,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hero Images (Mobile)
export const useHeroImagesMobile = () => {
  return useQuery({
    queryKey: ['hero-images-mobile'],
    queryFn: homeContentService.getHeroImagesMobile,
    staleTime: 5 * 60 * 1000,
  });
};

// Cards 1 - "Why Shop With True Style?"
export const useCards1 = () => {
  return useQuery({
    queryKey: ['cards-1'],
    queryFn: homeContentService.getCards1,
    staleTime: 5 * 60 * 1000,
  });
};

// Cards 2 - "Why Choose True Style?"
export const useCards2 = () => {
  return useQuery({
    queryKey: ['cards-2'],
    queryFn: homeContentService.getCards2,
    staleTime: 5 * 60 * 1000,
  });
};

// How It Works
export const useHowItWorks = () => {
  return useQuery({
    queryKey: ['how-it-works'],
    queryFn: homeContentService.getHowItWorks,
    staleTime: 5 * 60 * 1000,
  });
};

// Testimonials
export const useTestimonials = () => {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: homeContentService.getTestimonials,
    staleTime: 5 * 60 * 1000,
  });
};

// About
export const useAbout = () => {
  return useQuery({
    queryKey: ['about'],
    queryFn: homeContentService.getAbout,
    staleTime: 5 * 60 * 1000,
  });
};

// Policies
export const usePolicies = () => {
  return useQuery({
    queryKey: ['policies'],
    queryFn: homeContentService.getPolicies,
    staleTime: 5 * 60 * 1000,
  });
};

// Store Details
export const useStoreDetails = () => {
  return useQuery({
    queryKey: ['store-details'],
    queryFn: homeContentService.getStoreDetails,
    staleTime: 5 * 60 * 1000,
  });
};

// Contact Us Form Submission
export const useSubmitContactUs = () => {
  return useMutation({
    mutationFn: (data: ContactUsCreate) => homeContentService.submitContactUs(data),
    onSuccess: () => {
      toast.success('Message sent successfully! We will get back to you soon.');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to send message. Please try again.');
    },
  });
};
