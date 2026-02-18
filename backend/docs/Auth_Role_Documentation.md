# Authentication & Role-Based Access Control Documentation

**Project:** True Style – Online Clothing Store  
**Version:** v1.0  
**Last Updated:** 10-Nov-2025

## Overview
This document explains how authentication, session management, JWT token rotation, and RBAC (Role‑Based Access Control) are implemented in the **True Style FastAPI backend**.

The system uses:
- **JWT Access Tokens** (short-lived)  
- **JWT Refresh Tokens** stored in **HTTP‑only cookies**
- **Refresh token rotation** with **revocation tracking**
- **Redis‑based permission caching**
- **MongoDB for roles, permissions, and sessions**

---

## Authentication Flow

| Step | Description |
|------|-------------|
| **1. Register** | Users register with first name, last name, email, phone number, password. |
| **2. Login** | Credentials validated → Access + Refresh token issued. Refresh token stored in HTTP‑Only cookie. |
| **3. Access Token** | Used for authenticated API calls, contains user_id, role_id, wishlist_id, cart_id. |
| **4. Refresh Token** | Long‑lived, stored in cookies, allows silent token renewal. |
| **5. Rotation & Revocation** | Every refresh creates a new refresh token and revokes the old one in DB. |
| **6. Protected Routes** | `get_current_user` verifies token validity, expiry, revocation, and permission. |

---

## Token Structure
A valid **Access Token** contains:

```json
{
  "user_id": "671b2d6a3a63aa54cf80b3e3",
  "user_role_id": "671b2d6a3a63aa54cf80b3d0",
  "wishlist_id": "671b2d6a3a63aa54cf80b3e7",
  "cart_id": "671b2d6a3a63aa54cf80b3e9",
  "type": "access",
  "iat": 1731216000,
  "exp": 1731216300,
  "jti": "c07dd9e7-6fd7-45d4-b3ac-798cb18f1540"
}
```

A **Refresh Token** contains the same payload (without `type: access`) and lasts multiple days.

---

## Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| **POST** | `/api/v1/auth/register` | Customer/Admin signup | ❌ No |
| **POST** | `/api/v1/auth/login` | Get Access + Refresh token | ❌ No |
| **POST** | `/api/v1/auth/token/refresh` | Rotation of refresh token, return new access token | ✅ Cookie Needed |
| **POST** | `/api/v1/auth/logout` | Revokes both tokens + clears cookie | ✅ Yes |
| **POST** | `/api/v1/auth/change-password` | Change password | ✅ Yes |
| **POST** | `/api/v1/auth/forgot-password/request` | Send 6-digit OTP to email | ❌ No |
| **POST** | `/api/v1/auth/forgot-password/verify` | Reset password using OTP | ❌ No |

---

## Security Features
✅ **Passwords hashed** using bcrypt  
✅ **Access tokens short‑lived** (minutes)  
✅ **Refresh tokens stored in HTTP‑Only Secure Cookie**  
✅ **Refresh Token Rotation** (old RT becomes invalid)  
✅ **Revocation List in DB** prevents stolen token reuse  
✅ **Redis caching for permissions**  
✅ **OTP email for password reset (FastAPI‑Mail)**  

---

## get_current_user()
Every protected route depends on:

```python
current = Depends(get_current_user)
```

This function:
✅ Decodes JWT  
✅ Confirms token type = access  
✅ Checks expiration  
✅ Confirms not revoked  
✅ Extracts: `user_id`, `user_role_id`, `wishlist_id`, `cart_id`

Returned object example:

```json
{
  "user_id": "671b2d6a3a63aa54cf80b3e3",
  "user_role_id": "671b2d6a3a63aa54cf80b3d0",
  "wishlist_id": "671b2d6a3a63aa54cf80b3e7",
  "cart_id": "671b2d6a3a63aa54cf80b3e9"
}
```

---

## Role-Based Access Control (RBAC)

Two roles:

| Role | Description |
|------|-------------|
| **Admin** | Full access to manage products, orders, users, CMS, coupons, payments, backup, restore logs, etc. |
| **User (Customer)** | Can read products, manage profile, addresses, cart, wishlist, reviews, orders, payments, subscriptions |

Permissions stored in MongoDB:
- `permissions` collection holds allowed CRUD per resource
- `role_permissions` links roles to permissions
- Permission caching stored in Redis for performance

---

## Permission Check Dependency

```python
@router.get(
    "/products",
    dependencies=[Depends(require_permission("products","Read"))]
)
```
```python
@router.get(
    "/products",
    dependencies=[Depends(require_permission("products","Create"))]
)
```



`require_permission(resource, action, role=None)` validates:

✅ user authenticated  
✅ user role has matching permission record  
✅ checks Redis → fallback DB query → cache policy

---

## What Information Access Tokens Carry

| Field | Meaning |
|-------|---------|
| `user_id` | Current logged‑in user's Mongo ObjectId |
| `user_role_id` | Role reference (admin/user) |
| `wishlist_id` | Auto‑created wishlist on registration |
| `cart_id` | Auto‑created cart on registration |
| `jti` | Unique token ID for revocation tracking |

---

## Token Expiry Policy

| Token | Lifetime | Stored In | Strategy |
|-------|----------|------------|----------|
| **Access Token** | Few minutes | Memory/LocalStorage | Validates each request |
| **Refresh Token** | Many days | HTTP‑Only Cookie | Rotates, old RT revoked |

---

## Revocation Logic

- When user logs out → refresh + access token marked revoked in database
- When new refresh token is issued → old one revoked
- If a revoked token is reused → system blocks and responds 401

---

## Password Reset Workflow

1. User sends email to `/forgot-password/request`
2. Server generates 6‑digit OTP and stores it temporarily in user document
3. Email sent using FastAPI‑Mail
4. `/forgot-password/verify` validates OTP and updates password

---

## Login → Refresh → Logout Sequence

✅ Login  
→ Access + Refresh issued  
→ Wishlist/Cart auto bound to token

✅ Refresh  
→ old refresh hash revoked  
→ new refresh & access issued  
→ secure rotation

✅ Logout  
→ revoke both tokens  
→ clear cookie

---

## Example Request Headers

```http
Authorization: Bearer <ACCESS_TOKEN>
```

Cookies:

```
Set-Cookie: refresh_token=<JWT>; HttpOnly; Secure; SameSite=Lax
```

---

## Example Backend Protection

```python
@router.get("/orders", dependencies=[Depends(require_permission("orders","Read"))])
async def list_orders(current=Depends(get_current_user)):
    return ...
```

---

## Security Best Practices Used
✔ HTTP‑only cookies for refresh tokens  
✔ Password hashing  
✔ Expiring tokens  
✔ Revocation tracking  
✔ Redis caching  
✔ Separate Access & Refresh secrets  
✔ No refresh token in response body (only cookie)  

---

## Final Notes for Frontend Developers
- Always attach `Authorization: Bearer <access_token>`
- On 401 → call `/auth/token/refresh`
- Do **NOT** store refresh tokens and access tokens in browser storage
- Store the acess token in memory like for React - Context API, Angualr - Auth Service for easy state management

✅ Session model prevents stolen cookie reuse  

✅ OTP system prevents unauthorized password resets  

---

**End of Auth & Role Documentation**
