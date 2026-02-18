import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';

interface ErrorResponse {
  detail: string | Record<string, unknown>;
  message?: string;
}

interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

const ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'Authentication failed. Please login again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  422: 'Validation failed. Please check your input.',
  500: 'An unexpected error occurred. Please try again later.',
  502: 'Service temporarily unavailable. Please try again.',
  503: 'Service maintenance in progress. Please try again later.',
};

const SPECIFIC_ERROR_MAPPINGS: Record<string, string> = {
  'Invalid credentials': 'Email or password is incorrect.',
  'User not found': 'No account found with this email.',
  'Email already registered': 'This email is already in use.',
  'Phone number already registered': 'This phone number is already registered.',
  'Current password is incorrect': 'Your current password is incorrect.',
  'User account is suspended': 'Your account has been suspended. Please contact support.',
  'No refresh cookie': 'Session expired. Please login again.',
  'Invalid refresh token': 'Session expired. Please login again.',
  'Refresh token revoked': 'Session expired. Please login again.',
  'Session not found or revoked': 'Session expired. Please login again.',
  'No fields provided for update': 'Please provide at least one field to update.',
  'Invalid Pincode': 'Please enter a valid pincode.',
  'Internal Server Error': 'Something went wrong. Please try again.',
};

export const parseErrorDetail = (detail: string | Record<string, unknown> | ValidationError[]): string => {
  if (typeof detail === 'string') {
    return SPECIFIC_ERROR_MAPPINGS[detail] || detail;
  }

  if (Array.isArray(detail)) {
    const errors = detail.map((err: ValidationError) => {
      const field = err.loc[err.loc.length - 1];
      return `${field}: ${err.msg}`;
    }).join(', ');
    return errors || 'Validation failed';
  }

  if (typeof detail === 'object' && detail !== null) {
    return JSON.stringify(detail);
  }

  return 'An error occurred';
};

export const getErrorMessage = (error: unknown): string => {
  if (!error) {
    return 'An unexpected error occurred';
  }

  const axiosError = error as AxiosError<ErrorResponse>;

  if (axiosError.response) {
    const { status, data } = axiosError.response;
    
    if (data?.detail) {
      return parseErrorDetail(data.detail);
    }

    if (data?.message) {
      return data.message;
    }

    return ERROR_MESSAGES[status] || 'An error occurred';
  }

  if (axiosError.request) {
    const errorCode = (axiosError as { code?: string }).code;
    const errorMessage = axiosError.message?.toLowerCase() || '';
    
    if (errorCode === 'ERR_NETWORK' || errorMessage.includes('network error')) {
      return 'Cannot connect to the server. Please make sure the backend server is running.';
    }
    
    if (errorCode === 'ECONNREFUSED' || errorMessage.includes('econnrefused')) {
      return 'Backend server is not running. Please start the server and try again.';
    }
    
    if (errorMessage.includes('cors')) {
      return 'CORS error. Please check your server configuration.';
    }
    
    if (errorMessage.includes('timeout')) {
      return 'Request timeout. The server is taking too long to respond.';
    }
    
    return 'Network error. Please check your internet connection or make sure the backend server is running.';
  }

  if (axiosError.message) {
    return axiosError.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

export const handleApiError = (error: unknown, customMessage?: string): void => {
  const errorMessage = customMessage || getErrorMessage(error);
  
  const axiosError = error as AxiosError<ErrorResponse>;
  const statusCode = axiosError.response?.status;
  const isNetworkErr = !axiosError.response && !!axiosError.request;

  if (isNetworkErr) {
    toast.error(errorMessage, {
      position: 'top-right',
      autoClose: 6000,
      className: 'network-error-toast',
    });
    return;
  }

  switch (statusCode) {
    case 400:
    case 422:
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 4000,
      });
      break;

    case 401:
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
      break;

    case 403:
      toast.warning(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      });
      break;

    case 404:
      toast.info(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
      break;

    case 500:
    case 502:
    case 503:
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      });
      break;

    default:
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 4000,
      });
  }
};

export const handleSuccess = (message: string): void => {
  toast.success(message, {
    position: 'top-right',
    autoClose: 3000,
  });
};

export const isAuthError = (error: unknown): boolean => {
  const axiosError = error as AxiosError<ErrorResponse>;
  return axiosError.response?.status === 401;
};

export const isValidationError = (error: unknown): boolean => {
  const axiosError = error as AxiosError<ErrorResponse>;
  return axiosError.response?.status === 422 || axiosError.response?.status === 400;
};

export const isNetworkError = (error: unknown): boolean => {
  const axiosError = error as AxiosError;
  return !axiosError.response && !!axiosError.request;
};
