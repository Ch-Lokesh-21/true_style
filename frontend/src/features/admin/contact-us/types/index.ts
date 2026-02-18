// Contact Us Types
export interface ContactUs {
  id: string;
  email: string;
  name: string;
  message: string;
  created_at: string;
}

export interface ContactUsCreate {
  email: string;
  name: string;
  message: string;
}

export interface ContactUsUpdate {
  email?: string;
  name?: string;
  message?: string;
}

export interface ContactUsResponse {
  data: ContactUs[];
  total: number;
}