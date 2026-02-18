// Hero Images
export interface HeroImage {
  _id: string;
  category: string;
  idx: number;
  image_url: string;
  createdAt: string;
  updatedAt: string;
}

// Cards 1 - "Why Shop With True Style?"
export interface Card1 {
  _id: string;
  idx: number;
  title: string;
  image_url: string;
  createdAt: string;
  updatedAt: string;
}

// Cards 2 - "Why Choose True Style?"
export interface Card2 {
  _id: string;
  idx: number;
  title: string;
  image_url: string;
  createdAt: string;
  updatedAt: string;
}

// How It Works
export interface HowItWorks {
  _id: string;
  idx: number;
  title: string;
  image_url: string;
  createdAt: string;
  updatedAt: string;
}

// Testimonials
export interface Testimonial {
  _id: string;
  idx: number;
  image_url: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// About
export interface About {
  _id: string;
  idx: number;
  image_url: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Policies
export interface Policy {
  _id: string;
  idx: number;
  title: string;
  description: string;
  image_url: string;
  createdAt: string;
  updatedAt: string;
}

// Store Details
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

// Contact Us Form
export interface ContactUsCreate {
  name: string;
  email: string;
  message: string;
}
