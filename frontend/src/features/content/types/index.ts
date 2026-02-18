// Content types for all content management
export interface About {
  _id: string;
  idx: number;
  image_url: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface FAQ {
  _id: string;
  idx: number;
  image_url: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

export interface HeroImage {
  _id: string;
  category: string;
  idx: number;
  image_url: string;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  _id: string;
  idx: number;
  image_url: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface TermsAndConditions {
  _id: string;
  idx: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Policy {
  _id: string;
  idx: number;
  image_url: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface HowItWorks {
  _id: string;
  idx: number;
  image_url: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreDetails {
  _id: string;
  name: string;
  pan_no: string;
  gst_no: string;
  address: string;
  postal_code: number;
  country: string;
  state: string;
  city: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cards1 {
  _id: string;
  idx: number;
  title: string;
  image_url: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cards2 {
  _id: string;
  idx: number;
  title: string;
  image_url: string;
  createdAt: string;
  updatedAt: string;
}

// Form data types
export interface AboutFormData {
  idx: string;
  description: string;
  image: FileList | null;
}

export interface FAQFormData {
  idx: string;
  question: string;
  answer: string;
  image: FileList | null;
}

export interface HeroImageFormData {
  category: string;
  idx: string;
  image: FileList | null;
}

export interface TestimonialFormData {
  idx: string;
  description: string;
  image: FileList | null;
}

export interface TermsAndConditionsFormData {
  idx: string;
  description: string;
}

export interface PolicyFormData {
  idx: string;
  title: string;
  description: string;
  image: FileList | null;
}

export interface HowItWorksFormData {
  idx: string;
  title: string;
  image: FileList | null;
}

export interface StoreDetailsFormData {
  name: string;
  pan_no: string;
  gst_no: string;
  address: string;
  postal_code: string;
  country: string;
  state: string;
  city: string;
}

export interface Cards1FormData {
  idx: string;
  title: string;
  image: FileList | null;
}

export interface Cards2FormData {
  idx: string;
  title: string;
  image: FileList | null;
}

export type ContentType = 
  | 'about'
  | 'faq'
  | 'hero-images'
  | 'hero-images-mobile'
  | 'testimonials'
  | 'terms-and-conditions'
  | 'policies'
  | 'how-it-works'
  | 'store-details'
  | 'cards-1'
  | 'cards-2';
