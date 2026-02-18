# Understanding Error Status Codes

## Two Types of Errors

### 1. ❌ Network Errors (Backend NOT Running)
**What happens:** Request is sent but no response is received

**Characteristics:**
- ✅ `error.request` exists (request was made)
- ❌ `error.response` is undefined (no response received)
- ❌ **NO STATUS CODE** available
- Error code: `ERR_NETWORK` or `ECONNREFUSED`

**Console output:**
```
🔍 Error Analysis
Has response: false
Has request: true
Status code: NO STATUS CODE
Error code: ERR_NETWORK
❌ No response from backend - Request was sent but no response received
This means: Backend server is likely not running or unreachable
```

**User sees:**
> "Cannot connect to the server. Please make sure the backend server is running."

---

### 2. ✅ HTTP Errors (Backend IS Running)
**What happens:** Backend receives request and sends back an error response

**Characteristics:**
- ✅ `error.response` exists (got a response)
- ✅ `error.request` exists (request was made)
- ✅ **HAS STATUS CODE** (400, 401, 403, 404, 500, etc.)
- Response includes error details

**Console output:**
```
🔍 Error Analysis
Has response: true
Has request: true
Status code: 401
✅ Backend responded with status 401
⚠️ API ERROR: Backend responded with status code 401
```

**User sees:** (based on status code)
- **400**: "Email already registered" (validation error)
- **401**: "Email or password is incorrect" (auth error)
- **403**: "Your account has been suspended" (forbidden)
- **404**: "Resource not found"
- **500**: "Internal server error"

---

## Visual Comparison

### Scenario 1: Backend Not Running
```
Frontend → [Request] → ❌ Connection Refused → No Response
                       
Result: Network Error (NO STATUS CODE)
```

### Scenario 2: Backend Running with Error
```
Frontend → [Request] → Backend Processing → [Response with status 401] → Frontend
                       
Result: HTTP Error (STATUS CODE: 401)
```

---

## How to Check in Console (Development Mode)

When you try to login, open browser console (F12) and you'll see:

### If Backend NOT Running:
```
🔍 Error Analysis
├─ Has response: false          ← NO RESPONSE!
├─ Has request: true            ← Request was sent
├─ Status code: NO STATUS CODE  ← This is the key!
└─ Error code: ERR_NETWORK

❌ No response from backend
⚠️ NETWORK ERROR: No status code available because backend did not respond
```

### If Backend IS Running:
```
🔍 Error Analysis
├─ Has response: true           ← Got a response!
├─ Has request: true           
├─ Status code: 401             ← Status code present!
└─ Error code: undefined

✅ Backend responded with status 401
⚠️ API ERROR: Backend responded with status code 401
```

---

## Using Error Info Utility

You can use the `getErrorInfo` helper to check error details:

```typescript
import { getErrorInfo, ERROR_TYPES } from '@/utils/errorTypes';

try {
  await login(credentials);
} catch (error) {
  const errorInfo = getErrorInfo(error);
  
  console.log('Error Type:', errorInfo.type);
  console.log('Status Code:', errorInfo.statusCode || 'NONE');
  console.log('Has Response:', errorInfo.hasResponse);
  console.log('Message:', errorInfo.message);
  
  if (errorInfo.type === ERROR_TYPES.NETWORK) {
    console.log('Backend server is not running!');
  } else {
    console.log(`Backend returned status code: ${errorInfo.statusCode}`);
  }
}
```

---

## Summary Table

| Scenario | `error.response` | `error.request` | Status Code | Error Type |
|----------|------------------|-----------------|-------------|------------|
| Backend not running | ❌ `undefined` | ✅ exists | ❌ **NONE** | NETWORK |
| Invalid credentials | ✅ exists | ✅ exists | ✅ **401** | AUTH |
| Email already exists | ✅ exists | ✅ exists | ✅ **400** | VALIDATION |
| Account suspended | ✅ exists | ✅ exists | ✅ **403** | FORBIDDEN |
| Resource not found | ✅ exists | ✅ exists | ✅ **404** | NOT_FOUND |
| Server error | ✅ exists | ✅ exists | ✅ **500** | SERVER |

---

## Key Takeaway

**Status codes only exist when the backend responds!**

- 🔴 Backend not running = **NO status code** = Network error
- 🟢 Backend running with error = **HAS status code** = HTTP error

Now when you try to login without the backend running, check your browser console and you'll see detailed error information explaining exactly what's happening! 🎯
