
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ForgotPasswordVerify,
  MessageResponse,
  TokenRotatedResponse,
} from '../types/auth';
import axiosInstance from '../../../lib/axios';
import { API_ENDPOINTS } from '../../../config/constants';

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    );
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const response = await axiosInstance.post<User>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    return response.data;
  },

  logout: async (): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      API_ENDPOINTS.AUTH.LOGOUT
    );
    return response.data;
  },

  refreshToken: async (): Promise<TokenRotatedResponse> => {
    const response = await axiosInstance.post<TokenRotatedResponse>(
      API_ENDPOINTS.AUTH.REFRESH
    );
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      data
    );
    return response.data;
  },

  forgotPasswordRequest: async (data: ForgotPasswordRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD_REQUEST,
      data
    );
    return response.data;
  },

  forgotPasswordVerify: async (data: ForgotPasswordVerify): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD_VERIFY,
      data
    );
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await axiosInstance.get<User>(API_ENDPOINTS.USERS.ME);
    return response.data;
  },

  updateProfile: async (data: FormData): Promise<User> => {
    const response = await axiosInstance.put<User>(
      API_ENDPOINTS.USERS.ME,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};
