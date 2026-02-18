export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTH_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  SERVER: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  FORBIDDEN: 'FORBIDDEN_ERROR',
} as const;

export type ErrorType = typeof ERROR_TYPES[keyof typeof ERROR_TYPES];

export interface ErrorInfo {
  type: ErrorType;
  statusCode?: number;
  message: string;
  hasResponse: boolean;
  hasRequest: boolean;
}

export const getErrorInfo = (error: unknown): ErrorInfo => {
  const axiosError = error as {
    response?: { status?: number };
    request?: unknown;
    message?: string;
    code?: string;
  };

  const hasResponse = !!axiosError.response;
  const hasRequest = !!axiosError.request;
  const statusCode = axiosError.response?.status;

  if (!hasResponse && hasRequest) {
    return {
      type: ERROR_TYPES.NETWORK,
      hasResponse: false,
      hasRequest: true,
      message: 'Server is not available',
    };
  }

  switch (statusCode) {
    case 401:
      return {
        type: ERROR_TYPES.AUTH,
        statusCode,
        hasResponse: true,
        hasRequest: true,
        message: 'Authentication error',
      };

    case 400:
    case 422:
      return {
        type: ERROR_TYPES.VALIDATION,
        statusCode,
        hasResponse: true,
        hasRequest: true,
        message: 'Validation error',
      };

    case 403:
      return {
        type: ERROR_TYPES.FORBIDDEN,
        statusCode,
        hasResponse: true,
        hasRequest: true,
        message: 'Forbidden error',
      };

    case 404:
      return {
        type: ERROR_TYPES.NOT_FOUND,
        statusCode,
        hasResponse: true,
        hasRequest: true,
        message: 'Resource not found',
      };

    case 500:
    case 502:
    case 503:
      return {
        type: ERROR_TYPES.SERVER,
        statusCode,
        hasResponse: true,
        hasRequest: true,
        message: 'Server error',
      };

    default:
      return {
        type: statusCode ? ERROR_TYPES.SERVER : ERROR_TYPES.NETWORK,
        statusCode,
        hasResponse,
        hasRequest,
        message: statusCode ? `Error with status ${statusCode}` : 'Unknown error',
      };
  }
};
