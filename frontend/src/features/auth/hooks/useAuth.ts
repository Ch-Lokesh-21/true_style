import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAppDispatch } from '../../../app/store/hooks';
import { setCredentials, logout as logoutAction, setUser, setAccessToken } from '../../../app/store/slices/authSlice';
import { ROUTES } from '../../../config/constants';
import { handleApiError, handleSuccess } from '../../../utils/errorHandler';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  MessageResponse,
  TokenRotatedResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ForgotPasswordVerify,
} from '../types/auth';

export const useLogin = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return useMutation<LoginResponse, unknown, LoginRequest>({
    mutationFn: authService.login,
    onSuccess: (data) => {
      dispatch(setCredentials(data));
      
      const userRole = data.payload.user_role || 'user';
      
      if (userRole === 'admin') {
        navigate(ROUTES.ADMIN.HOME, { replace: true });
      } else {
        navigate(ROUTES.SHOP, { replace: true });
      }
      
      handleSuccess('Login successful!');
    },
    onError: (error) => handleApiError(error),
  });
};

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation<User, unknown, RegisterRequest>({
    mutationFn: authService.register,
    onSuccess: () => {
      handleSuccess('Registration successful! Please login.');
      navigate(ROUTES.LOGIN);
    },
    onError: (error) => handleApiError(error),
  });
};

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation<MessageResponse, unknown, void>({
    mutationFn: authService.logout,
    onSuccess: () => {
      dispatch(logoutAction());
      queryClient.clear();
      navigate(ROUTES.LOGIN);
      handleSuccess('Logged out successfully');
    },
    onError: (error: unknown) => {
      dispatch(logoutAction());
      queryClient.clear();
      navigate(ROUTES.LOGIN);
      handleApiError(error);
    },
  });
};

export const useRefreshToken = () => {
  const dispatch = useAppDispatch();

  return useMutation<TokenRotatedResponse, unknown, void>({
    mutationFn: authService.refreshToken,
    onSuccess: (data) => {
      dispatch(setAccessToken(data.access_token));
    },
    onError: () => {
      dispatch(logoutAction());
    },
  });
};

export const useChangePassword = () => {
  return useMutation<MessageResponse, unknown, ChangePasswordRequest>({
    mutationFn: authService.changePassword,
    onSuccess: (data) => {
      handleSuccess(data.message || 'Password changed successfully');
    },
    onError: (error) => handleApiError(error),
  });
};

export const useForgotPasswordRequest = () => {
  return useMutation<MessageResponse, unknown, ForgotPasswordRequest>({
    mutationFn: authService.forgotPasswordRequest,
    onSuccess: (data) => {
      handleSuccess(data.message || 'Password reset link sent to your email');
    },
    onError: (error) => handleApiError(error),
  });
};

export const useForgotPasswordVerify = () => {
  const navigate = useNavigate();

  return useMutation<MessageResponse, unknown, ForgotPasswordVerify>({
    mutationFn: authService.forgotPasswordVerify,
    onSuccess: (data) => {
      handleSuccess(data.message || 'Password reset successfully');
      navigate(ROUTES.LOGIN);
    },
    onError: (error) => handleApiError(error),
  });
};

export const useGetMe = (enabled: boolean = true) => {
  const dispatch = useAppDispatch();

  const query = useQuery({
    queryKey: ['user'],
    queryFn: authService.getMe,
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  if (query.data) {
    dispatch(setUser(query.data));
  }

  if (query.error) {
    dispatch(logoutAction());
  }

  return query;
};

export const useGetProfile = () => {
  return useQuery<User, unknown>({
    queryKey: ['user', 'profile'],
    queryFn: authService.getMe,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateProfile = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation<User, unknown, FormData>({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => {
      dispatch(setUser(data));
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      handleSuccess('Profile updated successfully');
    },
    onError: (error) => handleApiError(error),
  });
};
