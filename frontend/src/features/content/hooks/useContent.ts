import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  aboutService,
  faqService,
  heroImagesService,
  heroImagesMobileService,
  testimonialsService,
  termsAndConditionsService,
  policiesService,
  howItWorksService,
  storeDetailsService,
  cards1Service,
  cards2Service,
} from '../services/contentService';

// Helper to extract error messages
const getErrorMessage = (error: unknown): string => {
  const err = error as { response?: { data?: { detail?: string } } };
  return err.response?.data?.detail || 'An error occurred';
};

// About hooks
export const useAboutList = (params?: { skip?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['about', params],
    queryFn: async () => {
      const response = await aboutService.getAll(params);
      return response.data;
    },
  });
};

export const useAboutById = (id: string | null) => {
  return useQuery({
    queryKey: ['about', id],
    queryFn: async () => {
      if (!id) throw new Error('ID is required');
      const response = await aboutService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateAbout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => aboutService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about'] });
      toast.success('About item created successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateAbout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      aboutService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about'] });
      toast.success('About item updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeleteAbout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => aboutService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about'] });
      toast.success('About item deleted successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// FAQ hooks
export const useFAQList = (params?: { skip?: number; limit?: number; sort_by_idx?: boolean }) => {
  return useQuery({
    queryKey: ['faq', params],
    queryFn: async () => {
      const response = await faqService.getAll(params);
      return response.data;
    },
  });
};

export const useFAQById = (id: string | null) => {
  return useQuery({
    queryKey: ['faq', id],
    queryFn: async () => {
      if (!id) throw new Error('ID is required');
      const response = await faqService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateFAQ = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => faqService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq'] });
      toast.success('FAQ created successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateFAQ = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      faqService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq'] });
      toast.success('FAQ updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeleteFAQ = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => faqService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq'] });
      toast.success('FAQ deleted successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// Hero Images hooks
export const useHeroImagesList = (params?: { skip?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['hero-images', params],
    queryFn: async () => {
      const response = await heroImagesService.getAll(params);
      return response.data;
    },
  });
};

export const useHeroImageById = (id: string | null) => {
  return useQuery({
    queryKey: ['hero-images', id],
    queryFn: async () => {
      if (!id) throw new Error('ID is required');
      const response = await heroImagesService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateHeroImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => heroImagesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-images'] });
      toast.success('Hero image created successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateHeroImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      heroImagesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-images'] });
      toast.success('Hero image updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeleteHeroImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => heroImagesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-images'] });
      toast.success('Hero image deleted successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// Hero Images Mobile hooks
export const useHeroImagesMobileList = (params?: { skip?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['hero-images-mobile', params],
    queryFn: async () => {
      const response = await heroImagesMobileService.getAll(params);
      return response.data;
    },
  });
};

export const useHeroImageMobileById = (id: string | null) => {
  return useQuery({
    queryKey: ['hero-images-mobile', id],
    queryFn: async () => {
      if (!id) throw new Error('ID is required');
      const response = await heroImagesMobileService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateHeroImageMobile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => heroImagesMobileService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-images-mobile'] });
      toast.success('Mobile hero image created successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateHeroImageMobile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      heroImagesMobileService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-images-mobile'] });
      toast.success('Mobile hero image updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeleteHeroImageMobile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => heroImagesMobileService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-images-mobile'] });
      toast.success('Mobile hero image deleted successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// Testimonials hooks
export const useTestimonialsList = (params?: { skip?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['testimonials', params],
    queryFn: async () => {
      const response = await testimonialsService.getAll(params);
      return response.data;
    },
  });
};

export const useTestimonialById = (id: string | null) => {
  return useQuery({
    queryKey: ['testimonials', id],
    queryFn: async () => {
      if (!id) throw new Error('ID is required');
      const response = await testimonialsService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => testimonialsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      toast.success('Testimonial created successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      testimonialsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      toast.success('Testimonial updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeleteTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => testimonialsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      toast.success('Testimonial deleted successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// Terms and Conditions hooks  
export const useTermsAndConditionsList = (params?: { skip?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['terms-and-conditions', params],
    queryFn: async () => {
      const response = await termsAndConditionsService.getAll(params);
      return response.data;
    },
  });
};

export const useTermsAndConditionsById = (id: string | null) => {
  return useQuery({
    queryKey: ['terms-and-conditions', id],
    queryFn: async () => {
      if (!id) throw new Error('ID is required');
      const response = await termsAndConditionsService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateTermsAndConditions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => termsAndConditionsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms-and-conditions'] });
      toast.success('Terms and conditions created successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateTermsAndConditions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      termsAndConditionsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms-and-conditions'] });
      toast.success('Terms and conditions updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeleteTermsAndConditions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => termsAndConditionsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms-and-conditions'] });
      toast.success('Terms and conditions deleted successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// Policies hooks
export const usePoliciesList = (params?: { skip?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['policies', params],
    queryFn: async () => {
      const response = await policiesService.getAll(params);
      return response.data;
    },
  });
};

export const usePolicyById = (id: string | null) => {
  return useQuery({
    queryKey: ['policies', id],
    queryFn: async () => {
      if (!id) throw new Error('ID is required');
      const response = await policiesService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreatePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => policiesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success('Policy created successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      policiesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success('Policy updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeletePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => policiesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success('Policy deleted successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// How It Works hooks
export const useHowItWorksList = (params?: { skip?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['how-it-works', params],
    queryFn: async () => {
      const response = await howItWorksService.getAll(params);
      return response.data;
    },
  });
};

export const useHowItWorksById = (id: string | null) => {
  return useQuery({
    queryKey: ['how-it-works', id],
    queryFn: async () => {
      if (!id) throw new Error('ID is required');
      const response = await howItWorksService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateHowItWorks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => howItWorksService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['how-it-works'] });
      toast.success('How it works item created successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateHowItWorks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      howItWorksService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['how-it-works'] });
      toast.success('How it works item updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeleteHowItWorks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => howItWorksService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['how-it-works'] });
      toast.success('How it works item deleted successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// Store Details hooks
export const useStoreDetailsList = (params?: { skip?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['store-details', params],
    queryFn: async () => {
      const response = await storeDetailsService.getAll(params);
      return response.data;
    },
  });
};

export const useStoreDetailsById = (id: string | null) => {
  return useQuery({
    queryKey: ['store-details', id],
    queryFn: async () => {
      if (!id) throw new Error('ID is required');
      const response = await storeDetailsService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateStoreDetails = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => storeDetailsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-details'] });
      toast.success('Store details created successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateStoreDetails = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      storeDetailsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-details'] });
      toast.success('Store details updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeleteStoreDetails = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => storeDetailsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-details'] });
      toast.success('Store details deleted successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// Cards 1 hooks
export const useCards1List = (params?: { skip?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['cards-1', params],
    queryFn: async () => {
      const response = await cards1Service.getAll(params);
      return response.data;
    },
  });
};

export const useCards1ById = (id: string | null) => {
  return useQuery({
    queryKey: ['cards-1', id],
    queryFn: async () => {
      if (!id) throw new Error('ID is required');
      const response = await cards1Service.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateCards1 = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => cards1Service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards-1'] });
      toast.success('Card created successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateCards1 = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      cards1Service.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards-1'] });
      toast.success('Card updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeleteCards1 = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cards1Service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards-1'] });
      toast.success('Card deleted successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// Cards 2 hooks
export const useCards2List = (params?: { skip?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['cards-2', params],
    queryFn: async () => {
      const response = await cards2Service.getAll(params);
      return response.data;
    },
  });
};

export const useCards2ById = (id: string | null) => {
  return useQuery({
    queryKey: ['cards-2', id],
    queryFn: async () => {
      if (!id) throw new Error('ID is required');
      const response = await cards2Service.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateCards2 = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => cards2Service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards-2'] });
      toast.success('Card created successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateCards2 = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      cards2Service.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards-2'] });
      toast.success('Card updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeleteCards2 = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cards2Service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards-2'] });
      toast.success('Card deleted successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
};
