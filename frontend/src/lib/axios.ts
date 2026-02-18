import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_PREFIX } from '../config/constants';
import { store } from '../app/store';
import { setAccessToken, logout } from '../app/store/slices/authSlice';
import type { TokenRotatedResponse } from '../features/auth/types/auth';
import { toast } from 'react-toastify';
import { navigationService } from './navigationService';
import { ROUTES } from '../config/constants';

const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState();
    const token = state.auth.accessToken;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    if (config.url && (config.method === 'get' || config.method === 'post')) {
      const hasObjectId = /\/[0-9a-f]{24}($|\?|\/)/i.test(config.url);
      
      const excludePaths = [
        '/auth/',
        '/users/me',
        '/files/',
        '/my',
        '/refresh',
        '/login',
        '/register',
        '/logout',
        '/password/',
        '/set-status/',
        '/initiate-order',
        '/confirm-order',
        '/place-order-cod',
        '/options/',
      ];
      
      const shouldExclude = excludePaths.some(path => config.url!.includes(path));
      
      if (!hasObjectId && !shouldExclude && !config.url.endsWith('/')) {
        config.url += '/';
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post<TokenRotatedResponse>(
          `${API_BASE_URL}${API_PREFIX}/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

        const { access_token } = response.data;
        store.dispatch(setAccessToken(access_token));
        
        processQueue(null, access_token);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        
        const wasAuthenticated = store.getState().auth.isAuthenticated;
        
        store.dispatch(logout());
        
        if (wasAuthenticated && window.location.pathname !== ROUTES.LOGIN && window.location.pathname !== ROUTES.REGISTER) {
          toast.error('Your session has expired. Please login again.', {
            position: 'top-right',
            autoClose: 4000,
            toastId: 'session-expired-interceptor',
          });
          
          setTimeout(() => {
            navigationService.navigateTo(ROUTES.LOGIN, { replace: true });
          }, 500);
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
