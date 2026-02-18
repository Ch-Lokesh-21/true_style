import axiosInstance from '../../../lib/axios';
import { API_ENDPOINTS } from '../../../config/constants';
import type {
  About,
  FAQ,
  HeroImage,
  Testimonial,
  TermsAndConditions,
  Policy,
  HowItWorks,
  StoreDetails,
  Cards1,
  Cards2,
} from '../types';

// Generic CRUD functions
const createFormData = (data: Record<string, unknown>): FormData => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (value instanceof FileList && value.length > 0) {
        formData.append(key, value[0]);
      } else if (!(value instanceof FileList)) {
        formData.append(key, String(value));
      }
    }
  });
  return formData;
};

// About endpoints
export const aboutService = {
  getAll: (params?: { skip?: number; limit?: number }) =>
    axiosInstance.get<About[]>(API_ENDPOINTS.CONTENT.ABOUT, { params }),
  getById: (id: string) => axiosInstance.get<About>(`${API_ENDPOINTS.CONTENT.ABOUT}/${id}`),
  create: (data: Record<string, unknown>) =>
    axiosInstance.post<About>(API_ENDPOINTS.CONTENT.ABOUT, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, data: Record<string, unknown>) =>
    axiosInstance.put<About>(`${API_ENDPOINTS.CONTENT.ABOUT}/${id}`, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: string) => axiosInstance.delete(`${API_ENDPOINTS.CONTENT.ABOUT}/${id}`),
};

// FAQ endpoints
export const faqService = {
  getAll: (params?: { skip?: number; limit?: number; sort_by_idx?: boolean }) =>
    axiosInstance.get<FAQ[]>(API_ENDPOINTS.CONTENT.FAQ, { params }),
  getById: (id: string) => axiosInstance.get<FAQ>(`${API_ENDPOINTS.CONTENT.FAQ}/${id}`),
  create: (data: Record<string, unknown>) =>
    axiosInstance.post<FAQ>(API_ENDPOINTS.CONTENT.FAQ, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, data: Record<string, unknown>) =>
    axiosInstance.put<FAQ>(`${API_ENDPOINTS.CONTENT.FAQ}/${id}`, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: string) => axiosInstance.delete(`${API_ENDPOINTS.CONTENT.FAQ}/${id}`),
};

// Hero Images endpoints
export const heroImagesService = {
  getAll: (params?: { skip?: number; limit?: number }) =>
    axiosInstance.get<HeroImage[]>(API_ENDPOINTS.CONTENT.HERO_IMAGES, { params }),
  getById: (id: string) => axiosInstance.get<HeroImage>(`${API_ENDPOINTS.CONTENT.HERO_IMAGES}/${id}`),
  create: (data: Record<string, unknown>) =>
    axiosInstance.post<HeroImage>(API_ENDPOINTS.CONTENT.HERO_IMAGES, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, data: Record<string, unknown>) =>
    axiosInstance.put<HeroImage>(`${API_ENDPOINTS.CONTENT.HERO_IMAGES}/${id}`, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: string) => axiosInstance.delete(`${API_ENDPOINTS.CONTENT.HERO_IMAGES}/${id}`),
};

// Hero Images Mobile endpoints
export const heroImagesMobileService = {
  getAll: (params?: { skip?: number; limit?: number }) =>
    axiosInstance.get<HeroImage[]>(API_ENDPOINTS.CONTENT.HERO_IMAGES_MOBILE, { params }),
  getById: (id: string) => axiosInstance.get<HeroImage>(`${API_ENDPOINTS.CONTENT.HERO_IMAGES_MOBILE}/${id}`),
  create: (data: Record<string, unknown>) =>
    axiosInstance.post<HeroImage>(API_ENDPOINTS.CONTENT.HERO_IMAGES_MOBILE, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, data: Record<string, unknown>) =>
    axiosInstance.put<HeroImage>(`${API_ENDPOINTS.CONTENT.HERO_IMAGES_MOBILE}/${id}`, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: string) => axiosInstance.delete(`${API_ENDPOINTS.CONTENT.HERO_IMAGES_MOBILE}/${id}`),
};

// Testimonials endpoints
export const testimonialsService = {
  getAll: (params?: { skip?: number; limit?: number }) =>
    axiosInstance.get<Testimonial[]>(API_ENDPOINTS.CONTENT.TESTIMONIALS, { params }),
  getById: (id: string) => axiosInstance.get<Testimonial>(`${API_ENDPOINTS.CONTENT.TESTIMONIALS}/${id}`),
  create: (data: Record<string, unknown>) =>
    axiosInstance.post<Testimonial>(API_ENDPOINTS.CONTENT.TESTIMONIALS, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, data: Record<string, unknown>) =>
    axiosInstance.put<Testimonial>(`${API_ENDPOINTS.CONTENT.TESTIMONIALS}/${id}`, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: string) => axiosInstance.delete(`${API_ENDPOINTS.CONTENT.TESTIMONIALS}/${id}`),
};

// Terms and Conditions endpoints
export const termsAndConditionsService = {
  getAll: (params?: { skip?: number; limit?: number }) =>
    axiosInstance.get<TermsAndConditions[]>(API_ENDPOINTS.CONTENT.TERMS, { params }),
  getById: (id: string) => axiosInstance.get<TermsAndConditions>(`${API_ENDPOINTS.CONTENT.TERMS}/${id}`),
  create: (data: Record<string, unknown>) =>
    axiosInstance.post<TermsAndConditions>(API_ENDPOINTS.CONTENT.TERMS, data),
  update: (id: string, data: Record<string, unknown>) =>
    axiosInstance.put<TermsAndConditions>(`${API_ENDPOINTS.CONTENT.TERMS}/${id}`, data),
  delete: (id: string) => axiosInstance.delete(`${API_ENDPOINTS.CONTENT.TERMS}/${id}`),
};

// Policies endpoints
export const policiesService = {
  getAll: (params?: { skip?: number; limit?: number }) =>
    axiosInstance.get<Policy[]>(API_ENDPOINTS.CONTENT.POLICIES, { params }),
  getById: (id: string) => axiosInstance.get<Policy>(`${API_ENDPOINTS.CONTENT.POLICIES}/${id}`),
  create: (data: Record<string, unknown>) =>
    axiosInstance.post<Policy>(API_ENDPOINTS.CONTENT.POLICIES, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, data: Record<string, unknown>) =>
    axiosInstance.put<Policy>(`${API_ENDPOINTS.CONTENT.POLICIES}/${id}`, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: string) => axiosInstance.delete(`${API_ENDPOINTS.CONTENT.POLICIES}/${id}`),
};

// How It Works endpoints
export const howItWorksService = {
  getAll: (params?: { skip?: number; limit?: number }) =>
    axiosInstance.get<HowItWorks[]>(API_ENDPOINTS.CONTENT.HOW_IT_WORKS, { params }),
  getById: (id: string) => axiosInstance.get<HowItWorks>(`${API_ENDPOINTS.CONTENT.HOW_IT_WORKS}/${id}`),
  create: (data: Record<string, unknown>) =>
    axiosInstance.post<HowItWorks>(API_ENDPOINTS.CONTENT.HOW_IT_WORKS, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, data: Record<string, unknown>) =>
    axiosInstance.put<HowItWorks>(`${API_ENDPOINTS.CONTENT.HOW_IT_WORKS}/${id}`, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: string) => axiosInstance.delete(`${API_ENDPOINTS.CONTENT.HOW_IT_WORKS}/${id}`),
};

// Store Details endpoints
export const storeDetailsService = {
  getAll: (params?: { skip?: number; limit?: number }) =>
    axiosInstance.get<StoreDetails[]>(API_ENDPOINTS.CONTENT.STORE_DETAILS, { params }),
  getById: (id: string) => axiosInstance.get<StoreDetails>(`${API_ENDPOINTS.CONTENT.STORE_DETAILS}/${id}`),
  create: (data: Record<string, unknown>) =>
    axiosInstance.post<StoreDetails>(API_ENDPOINTS.CONTENT.STORE_DETAILS, data),
  update: (id: string, data: Record<string, unknown>) =>
    axiosInstance.put<StoreDetails>(`${API_ENDPOINTS.CONTENT.STORE_DETAILS}/${id}`, data),
  delete: (id: string) => axiosInstance.delete(`${API_ENDPOINTS.CONTENT.STORE_DETAILS}/${id}`),
};

// Cards 1 endpoints
export const cards1Service = {
  getAll: (params?: { skip?: number; limit?: number }) =>
    axiosInstance.get<Cards1[]>(API_ENDPOINTS.CONTENT.CARDS_1, { params }),
  getById: (id: string) => axiosInstance.get<Cards1>(`${API_ENDPOINTS.CONTENT.CARDS_1}/${id}`),
  create: (data: Record<string, unknown>) =>
    axiosInstance.post<Cards1>(API_ENDPOINTS.CONTENT.CARDS_1, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, data: Record<string, unknown>) =>
    axiosInstance.put<Cards1>(`${API_ENDPOINTS.CONTENT.CARDS_1}/${id}`, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: string) => axiosInstance.delete(`${API_ENDPOINTS.CONTENT.CARDS_1}/${id}`),
};

// Cards 2 endpoints
export const cards2Service = {
  getAll: (params?: { skip?: number; limit?: number }) =>
    axiosInstance.get<Cards2[]>(API_ENDPOINTS.CONTENT.CARDS_2, { params }),
  getById: (id: string) => axiosInstance.get<Cards2>(`${API_ENDPOINTS.CONTENT.CARDS_2}/${id}`),
  create: (data: Record<string, unknown>) =>
    axiosInstance.post<Cards2>(API_ENDPOINTS.CONTENT.CARDS_2, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, data: Record<string, unknown>) =>
    axiosInstance.put<Cards2>(`${API_ENDPOINTS.CONTENT.CARDS_2}/${id}`, createFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: string) => axiosInstance.delete(`${API_ENDPOINTS.CONTENT.CARDS_2}/${id}`),
};
