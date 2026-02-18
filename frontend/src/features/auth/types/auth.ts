export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  country_code: string;
  phone_no: string;
  password: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordVerify {
  email: string;
  otp: number;
  new_password: string;
}

export interface TokenResponse {
  access_token: string;
  access_jti: string;
  access_exp: number;
  token_type: string;
}

export interface LoginResponse extends TokenResponse {
  payload: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    role_id: string;
    user_status_id: string;
    user_role?: string;
    wishlist_id?: string;
    cart_id?: string;
  };
}

export interface TokenRotatedResponse extends TokenResponse {
  rotated: boolean;
}

export interface MessageResponse {
  message: string;
}

export interface User {
  _id: string;
  user_status_id: string;
  role_id: string;
  user_role?: string;
  first_name: string;
  last_name: string;
  email: string;
  country_code: string;
  phone_no: string;
  profile_img_url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
}

export interface ApiError {
  detail: string;
  status?: number;
}
