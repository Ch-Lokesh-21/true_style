import axiosInstance from '../../../lib/axios';
import { API_ENDPOINTS } from '../../../config/constants';
import type {
  HeroImage,
  Card1,
  Card2,
  HowItWorks,
  Testimonial,
  About,
  Policy,
  StoreDetails,
  ContactUsCreate,
} from '../types';

export const homeContentService = {
  // Hero Images (Desktop)
  getHeroImages: async (): Promise<HeroImage[]> => {
    const response = await axiosInstance.get<HeroImage[]>(API_ENDPOINTS.CONTENT.HERO_IMAGES);
    return response.data;
  },

  // Hero Images (Mobile)
  getHeroImagesMobile: async (): Promise<HeroImage[]> => {
    const response = await axiosInstance.get<HeroImage[]>(API_ENDPOINTS.CONTENT.HERO_IMAGES_MOBILE);
    return response.data;
  },

  // Cards 1 - "Why Shop With True Style?"
  getCards1: async (): Promise<Card1[]> => {
    const response = await axiosInstance.get<Card1[]>(API_ENDPOINTS.CONTENT.CARDS_1);
    return response.data;
  },

  // Cards 2 - "Why Choose True Style?"
  getCards2: async (): Promise<Card2[]> => {
    const response = await axiosInstance.get<Card2[]>(API_ENDPOINTS.CONTENT.CARDS_2);
    return response.data;
  },

  // How It Works
  getHowItWorks: async (): Promise<HowItWorks[]> => {
    const response = await axiosInstance.get<HowItWorks[]>(API_ENDPOINTS.CONTENT.HOW_IT_WORKS);
    return response.data;
  },

  // Testimonials
  getTestimonials: async (): Promise<Testimonial[]> => {
    const response = await axiosInstance.get<Testimonial[]>(API_ENDPOINTS.CONTENT.TESTIMONIALS);
    return response.data;
  },

  // About
  getAbout: async (): Promise<About[]> => {
    const response = await axiosInstance.get<About[]>(API_ENDPOINTS.CONTENT.ABOUT);
    return response.data;
  },

  // Policies
  getPolicies: async (): Promise<Policy[]> => {
    const response = await axiosInstance.get<Policy[]>(API_ENDPOINTS.CONTENT.POLICIES);
    return response.data;
  },

  // Store Details
  getStoreDetails: async (): Promise<StoreDetails[]> => {
    const response = await axiosInstance.get<StoreDetails[]>(API_ENDPOINTS.CONTENT.STORE_DETAILS);
    return response.data;
  },

  // Contact Us - Submit form
  submitContactUs: async (data: ContactUsCreate): Promise<void> => {
    await axiosInstance.post(API_ENDPOINTS.ADMIN.CONTACT_US, data);
  },
};
