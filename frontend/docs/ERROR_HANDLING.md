# API Error Handling Guide

## Overview

This project implements a centralized error handling system that gracefully handles all API errors with proper toast notifications and user-friendly messages. The system is integrated with Axios interceptors and React Query hooks.

## Architecture

### 1. Error Handler Utility (`src/utils/errorHandler.ts`)

The core error handling utility provides:
- **Status Code Mapping**: Maps HTTP status codes to user-friendly messages
- **Specific Error Mappings**: Translates backend error messages to frontend messages
- **Toast Notifications**: Automatically shows appropriate toast notifications
- **Error Type Checking**: Helper functions to identify error types

### 2. Axios Interceptors (`src/lib/axios.ts`)

The Axios instance includes:
- **Request Interceptor**: Automatically attaches access tokens
- **Response Interceptor**: Handles 401 errors with automatic token refresh
- **Error Logging**: Logs errors in development mode
- **Automatic Redirect**: Redirects to login on authentication failure

### 3. React Query Hooks (`src/hooks/useAuth.ts`)

All hooks use the centralized error handler:
- Type-safe mutations with proper TypeScript types
- Automatic error handling with toast notifications
- Success message handling

## Backend Error Patterns

### Status Codes

| Status Code | Type | Usage |
|------------|------|-------|
| 400 | Bad Request | Validation errors, duplicate data, incorrect input |
| 401 | Unauthorized | Invalid credentials, expired tokens, missing auth |
| 403 | Forbidden | Account suspended, insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Invalid data format (e.g., invalid pincode) |
| 500 | Internal Server Error | Generic server errors |
| 502 | Bad Gateway | Service temporarily unavailable |
| 503 | Service Unavailable | Maintenance mode |

### Error Response Format

Backend returns errors in this format:
```json
{
  "detail": "Error message"
}
```

Or for validation errors:
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "Invalid email format",
      "type": "value_error"
    }
  ]
}
```

## Common Error Messages

### Authentication Errors (401)
- "Invalid credentials" → "Email or password is incorrect."
- "User not found" → "No account found with this email."
- "No refresh cookie" → "Session expired. Please login again."
- "Invalid refresh token" → "Session expired. Please login again."
- "Refresh token revoked" → "Session expired. Please login again."
- "Session not found or revoked" → "Session expired. Please login again."

### Validation Errors (400)
- "Email already registered" → "This email is already in use."
- "Phone number already registered" → "This phone number is already registered."
- "Current password is incorrect" → "Your current password is incorrect."
- "No fields provided for update" → "Please provide at least one field to update."

### Authorization Errors (403)
- "User account is suspended" → "Your account has been suspended. Please contact support."

### Other Errors
- 404 → "The requested resource was not found."
- 422 → "Validation failed. Please check your input."
- 500 → "An unexpected error occurred. Please try again later."

## Usage Examples

### 1. Using in React Query Hooks

```typescript
import { useMutation } from '@tanstack/react-query';
import { handleApiError, handleSuccess } from '../utils/errorHandler';
import type { YourRequestType, YourResponseType } from '../types';

export const useYourMutation = () => {
  return useMutation<YourResponseType, unknown, YourRequestType>({
    mutationFn: yourServiceFunction,
    onSuccess: (data) => {
      handleSuccess('Operation successful!');
      // Additional success logic
    },
    onError: (error) => handleApiError(error),
  });
};
```

### 2. Manual Error Handling

```typescript
import { handleApiError, getErrorMessage } from '../utils/errorHandler';
import axiosInstance from '../lib/axios';

try {
  const response = await axiosInstance.post('/endpoint', data);
  // Handle success
} catch (error) {
  // Option 1: Show toast automatically
  handleApiError(error);
  
  // Option 2: Get error message without showing toast
  const errorMessage = getErrorMessage(error);
  console.error(errorMessage);
  
  // Option 3: Show custom message
  handleApiError(error, 'Custom error message');
}
```

### 3. Error Type Checking

```typescript
import { 
  isAuthError, 
  isValidationError, 
  isNetworkError 
} from '../utils/errorHandler';

try {
  await someApiCall();
} catch (error) {
  if (isAuthError(error)) {
    // Handle authentication errors
    console.log('User needs to re-authenticate');
  } else if (isValidationError(error)) {
    // Handle validation errors
    console.log('Invalid input data');
  } else if (isNetworkError(error)) {
    // Handle network errors
    console.log('No internet connection');
  }
}
```

### 4. Custom Toast Configuration

```typescript
import { handleApiError } from '../utils/errorHandler';

// The function automatically configures toast based on status code:
// - 400/422: Error toast, 4s duration
// - 401: Error toast, 3s duration
// - 403: Warning toast, 5s duration
// - 404: Info toast, 3s duration
// - 500/502/503: Error toast, 5s duration
```

## Toast Notification Types

The error handler automatically selects the appropriate toast type:

| Status Code | Toast Type | Duration | Position |
|------------|-----------|----------|----------|
| 400, 422 | error | 4s | top-right |
| 401 | error | 3s | top-right |
| 403 | warning | 5s | top-right |
| 404 | info | 3s | top-right |
| 500, 502, 503 | error | 5s | top-right |
| Success | success | 3s | top-right |

## Axios Interceptor Flow

```
Request → Add Auth Token → Send to Backend
                ↓
          Response/Error
                ↓
            Status 401?
           /            \
         Yes             No
          ↓               ↓
    Try Refresh    Return Error
          ↓
   Success/Fail
      /       \
    Yes        No
     ↓          ↓
  Retry    Logout +
 Original   Redirect
 Request    to Login
```

## Token Refresh Logic

The interceptor handles token refresh automatically:

1. **Detects 401 Error**: On any API call except login/refresh
2. **Prevents Race Conditions**: Queues concurrent requests during refresh
3. **Calls Refresh Endpoint**: `/auth/token/refresh` with HTTP-only cookie
4. **Updates Redux**: Stores new access token
5. **Retries Failed Requests**: With new token
6. **Handles Failure**: Logs out user and redirects to login

## Error Logging

In development mode, all errors are logged to console:

```typescript
console.error('API Error:', {
  url: '/api/endpoint',
  method: 'POST',
  status: 400,
  message: 'Email already registered',
  data: { detail: 'Email already registered' }
});
```

## Best Practices

### ✅ Do:
- Use `handleApiError(error)` for all API error handling
- Use `handleSuccess(message)` for success notifications
- Provide specific success messages in hooks
- Let the interceptor handle 401 errors automatically
- Use type-safe mutations with proper TypeScript types

### ❌ Don't:
- Don't parse error messages manually
- Don't create custom toast notifications for API errors
- Don't handle 401 errors in individual hooks
- Don't redirect to login manually (interceptor handles it)
- Don't use generic error messages

## Adding New Error Mappings

To add new specific error mappings, update `src/utils/errorHandler.ts`:

```typescript
const SPECIFIC_ERROR_MAPPINGS: Record<string, string> = {
  // Add new mappings here
  'Backend error message': 'User-friendly frontend message',
};
```

## Testing Error Handling

### Test 401 Error (Token Refresh)
```typescript
// The interceptor will automatically refresh the token
await axiosInstance.get('/protected-endpoint');
```

### Test 400 Error (Validation)
```typescript
// Submit form with invalid data
await registerMutation.mutateAsync({
  email: 'existing@email.com', // Already registered
  // ... other fields
});
// Toast: "This email is already in use."
```

### Test 403 Error (Suspended Account)
```typescript
// Login with suspended account
await loginMutation.mutateAsync({
  email: 'suspended@email.com',
  password: 'password123'
});
// Toast (Warning): "Your account has been suspended. Please contact support."
```

### Test Network Error
```typescript
// Turn off backend server
await axiosInstance.get('/endpoint');
// Toast: "Network error. Please check your internet connection."
```

## Migration from Old Error Handling

### Before (Manual)
```typescript
onError: (error: unknown) => {
  const errorMessage = (error as { 
    response?: { data?: { detail?: string } } 
  }).response?.data?.detail || 'Operation failed';
  toast.error(errorMessage);
}
```

### After (Centralized)
```typescript
onError: (error) => handleApiError(error)
```

## Related Files

- `src/utils/errorHandler.ts` - Core error handling utility
- `src/lib/axios.ts` - Axios instance with interceptors
- `src/hooks/useAuth.ts` - Example implementation in hooks
- `src/types/auth.ts` - TypeScript types for auth

## Support

For issues or questions about error handling:
1. Check backend error response format
2. Verify error message mappings in `errorHandler.ts`
3. Check console logs in development mode
4. Review Axios interceptor logic for token refresh issues
