
# True Style – Online Clothing Store Backend (FastAPI)

True Style is a production‑grade **FastAPI** backend for a fashion e‑commerce platform. It provides secure authentication, catalog & content management, cart/wishlist, orders, returns, exchanges, reviews & ratings, coupons, payments, analytics dashboards, backups, and system logging. Data is primarily stored in **MongoDB** (with **GridFS** for images), while **PostgreSQL** is used for **contact_us** submissions and **logs**. **Redis** caches RBAC permissions for high performance.

---

## 1) Problem Statement
Traditional apparel shopping creates friction—customers struggle with discovery, sizing, and order reliability, while admins lack precise control over catalogs, inventory, promotions, and analytics. True Style streamlines the customer journey and gives the admin rich management & insights.

**Actors:** Admin, Customer (end‑user).

---

## 2) Key Features

### 2.1 Customer
- Register/login, profile update, saved addresses.
- Browse/search/filter products by brand/category/occasion/type/price/size/color/rating.
- Wishlist & Cart; checkout with coupons.
- Orders: place, track (Placed → Confirmed → Packed → Shipped → Delivered), cancel if not shipped.
- Returns & Exchanges (within policy).
- Reviews & Ratings (with optional photos).
- Order history, re‑order, GST invoice download.
- Feedback/contact to store owner.

### 2.2 Admin (Store Owner)
- Product management (brands, categories, product types, size charts thumbnails).
- Customer management.
- Order processing; returns/exchanges workflow.
- Sales analytics dashboard: revenue trends, AOV, payment mix, top products, low stock.
- Content management: hero banners, cards, how‑it‑works, testimonials, about, policies, FAQ, terms, store details.
- Coupons & promotions.
- Data backup (on‑demand/scheduled), restore logs & system health.
- Reports & exports (CSV/PDF; via endpoints or planned jobs).

---

## 3) Technology Stack

| Layer | Technology |
|------|------------|
| Language | Python 3.12 |
| Web Framework | FastAPI |
| Primary DB | MongoDB (Motor async driver) |
| File Storage | GridFS (images) |
| Secondary DB | PostgreSQL (SQLAlchemy Async) — used for **contact_us** and **logs** |
| Cache | Redis (rbac permission cache) |
| Auth | JWT (access) + secure Refresh Cookie rotation |
| Email | fastapi-mail (OTP/reset) |
| Validation | Pydantic v2 |
| Password Hash | bcrypt/bcrypt_sha256 |
| Server | Uvicorn |

**Custom Middleware:** `RequestLoggingMiddleware` prints metadata and computation time per request.

---

## 4) Prerequisites

- Python 3.12.x
- MongoDB 6+
- Redis 7+
- PostgreSQL 13+
- `pip` and a virtual environment tool

---

## 5) Installation & Setup

```bash
# 1) Clone the repository
git clone 
cd 

# 2) Create & activate virtual environment
python -m venv .venv
# Windows
.\.venv\Scriptsctivate
# Linux/Mac
# source .venv/bin/activate

# 3) Install dependencies
pip install -r requirements.txt

# 4) Configure environment
cp .env.example .env
# Edit .env with real values (see section below)

# 5) Seed initial data (indexes, RBAC, lookup rows, admin & sample users)
python -m scripts.seed

# 6) Run the server (dev)
uvicorn app.main:app --reload --port 8000
```

---

## 6) Environment Variables (from `app/core/config.py`)

```bash
PROJECT_NAME=True Style
API_V1_PREFIX=/api/v1
MONGO_URI=mongodb://localhost:27017
MONGO_DB=truestyle
REDIS_HOST=redis://localhost:6379/0
PERM_CACHE_TTL_SECONDS=3600
GRIDFS_BUCKET=images
POSTGRESQL_URI=postgresql+asyncpg://user:password@localhost:5432/truestyle
BACKEND_BASE_URL=http://localhost:8000
UPLOAD_MAX_BYTES=5242880
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png

JWT_ACCESS_TOKEN_SECRET=change_me
JWT_REFRESH_TOKEN_SECRET=change_me_too
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=30

MAIL_USERNAME=you@example.com
MAIL_PASSWORD=app_password
MAIL_FROM=you@example.com
MAIL_FROM_NAME=True Style
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_STARTTLS=True
MAIL_SSL_TLS=False
USE_CREDENTIALS=True
VALIDATE_CERTS=True

REFRESH_COOKIE_NAME=ts_rt
REFRESH_COOKIE_PATH=/
REFRESH_COOKIE_SECURE=False
REFRESH_COOKIE_SAMESITE=lax
REFRESH_COOKIE_MAX_AGE_DAYS=30
TOKEN_HASH_PEPPER=some_random_pepper

BACKUP_BASE_PATH=./backups
CARD_ENC_KEY=YOUR_FERNET_KEY_BASE64
```

**Notes:**  
- `CARD_ENC_KEY` is a **Fernet** key used by `utils/crypto.py` to encrypt/decrypt card numbers.  
- Uploads are validated against `UPLOAD_ALLOWED_TYPES` and `UPLOAD_MAX_BYTES`.  
- Refresh token is stored as an **HTTP‑only** cookie (`REFRESH_COOKIE_NAME`, `Secure`, `SameSite`, `Max‑Age`).

---

## 7) Database Setup

### 7.1 MongoDB
- All domain collections live in MongoDB (users, products, orders, returns, exchanges, reviews, ratings, carts, wishlists, addresses, coupons, payments, CMS, backups, restores, RBAC tables, etc.).
- Images are stored in **GridFS** bucket named via `GRIDFS_BUCKET`.
- Indexes are created by `scripts.seed` (unique keys, FK‑style indexes, and compound uniques).

### 7.2 PostgreSQL
- Used for **contact_us** and **logs** tables (created via `Base.metadata.create_all` at startup).

### 7.3 Seeding (atomic, transactional where possible)
Run:
```bash
python -m scripts.seed
```
This performs:
- ✅ Index creation (non‑transactional DDL).
- ✅ RBAC seeding (roles/permissions/role_permissions).
- ✅ Lookup data (`user_status`, `order_status`, `return_status`, `exchange_status`, `review_status`, `payment_types`, `payment_status`, `coupons_status`, `occasions`, `categories`, `brands`).
- ✅ Initial users (admin + normal), and creates **cart** + **wishlist** for each user.

---

## 8) Running the Application

```bash
# Development
uvicorn app.main:app --reload --port 8000

# Production (example)
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Swagger UI: `http://localhost:8000/docs` (custom UI with dropdown filter)  
ReDoc: `http://localhost:8000/redoc`  
OpenAPI JSON: `http://localhost:8000/openapi.json`

---

## 9) Authentication & Authorization

- **OAuth2PasswordBearer** for access token retrieval in protected endpoints.
- **JWT Access Token** (short‑lived) + **Refresh Token** (HTTP‑only cookie).
- **Token rotation**: refresh use causes old refresh to be revoked; sessions are stored with `refresh_hash` and `exp`.
- **Revocation**: both access & refresh JTIs are added to a revocation collection when needed.
- **RBAC**: `require_permission(resource, action)` fetches from MongoDB permissions and caches the policy in **Redis**.
- **OTP**: Email OTP for forgot‑password, via `fastapi-mail` with responsive HTML template.

---

## 10) Files & Images (GridFS)

- Uploads validated via MIME and size (`UPLOAD_ALLOWED_TYPES`, `UPLOAD_MAX_BYTES`).
- `upload_image(file)` streams chunks to GridFS.
- `replace_image(old_id, new_file)` uploads new and deletes old if present.
- Public URL format: `{BACKEND_BASE_URL}{API_V1_PREFIX}/files/{file_id}`.

---

## 11) Logging Middleware

`RequestLoggingMiddleware` (custom) prints request meta + computation time for every request, aiding performance monitoring.

---

## 12) Project Structure

```
└──backend/
    ├── .env
    ├── .gitignore
    ├── main.py
    ├── README.md
    ├── requirements.txt
    ├── scripts/
    │   ├── seed.py
    │   ├── __init__.py
    ├── app/
    │   ├── main.py
    │   ├── __init__.py
    │   ├── utils/
    │   │   ├── crypto.py
    │   │   ├── fastapi_mail.py
    │   │   ├── gridfs.py
    │   │   ├── mongo.py
    │   │   ├── tokens.py
    │   │   └── __init__.py
    │   ├── services/
    │   │   ├── about.py
    │   │   ├── address.py
    │   │   ├── auth.py
    │   │   ├── backup_logs.py
    │   │   ├── brands.py
    │   │   ├── cards_1.py
    │   │   ├── cards_2.py
    │   │   ├── card_details.py
    │   │   ├── cart_items.py
    │   │   ├── categories.py
    │   │   ├── contact_us.py
    │   │   ├── coupons.py
    │   │   ├── coupons_status.py
    │   │   ├── dashboard.py
    │   │   ├── exchanges.py
    │   │   ├── exchange_status.py
    │   │   ├── faq.py
    │   │   ├── files.py
    │   │   ├── hero_images.py
    │   │   ├── how_it_works.py
    │   │   ├── logs.py
    │   │   ├── log_writer.py
    │   │   ├── occasions.py
    │   │   ├── orders.py
    │   │   ├── order_items.py
    │   │   ├── order_status.py
    │   │   ├── payments.py
    │   │   ├── payment_status.py
    │   │   ├── payment_types.py
    │   │   ├── policies.py
    │   │   ├── products.py
    │   │   ├── product_images.py
    │   │   ├── product_types.py
    │   │   ├── restore_logs.py
    │   │   ├── returns.py
    │   │   ├── return_status.py
    │   │   ├── review_status.py
    │   │   ├── store_details.py
    │   │   ├── terms_and_conditions.py
    │   │   ├── testimonials.py
    │   │   ├── upi_details.py
    │   │   ├── users.py
    │   │   ├── user_address.py
    │   │   ├── user_ratings.py
    │   │   ├── user_reviews.py
    │   │   ├── user_roles.py
    │   │   ├── user_status.py
    │   │   └── wishlist_items.py
    │   ├── schemas/
    │   │   ├── about.py
    │   │   ├── backup_logs.py
    │   │   ├── brands.py
    │   │   ├── cards_1.py
    │   │   ├── cards_2.py
    │   │   ├── card_details.py
    │   │   ├── carts.py
    │   │   ├── cart_items.py
    │   │   ├── categories.py
    │   │   ├── contact_us.py
    │   │   ├── coupons.py
    │   │   ├── coupons_status.py
    │   │   ├── dashboard.py
    │   │   ├── exchanges.py
    │   │   ├── exchange_status.py
    │   │   ├── faq.py
    │   │   ├── hero_images.py
    │   │   ├── how_it_works.py
    │   │   ├── logs.py
    │   │   ├── object_id.py
    │   │   ├── occasions.py
    │   │   ├── orders.py
    │   │   ├── order_items.py
    │   │   ├── order_status.py
    │   │   ├── payments.py
    │   │   ├── payment_status.py
    │   │   ├── payment_types.py
    │   │   ├── policies.py
    │   │   ├── products.py
    │   │   ├── product_images.py
    │   │   ├── product_types.py
    │   │   ├── requests.py
    │   │   ├── responses.py
    │   │   ├── restore_logs.py
    │   │   ├── returns.py
    │   │   ├── return_status.py
    │   │   ├── review_status.py
    │   │   ├── sessions.py
    │   │   ├── store_details.py
    │   │   ├── terms_and_conditions.py
    │   │   ├── testimonials.py
    │   │   ├── token_revocations.py
    │   │   ├── upi_details.py
    │   │   ├── users.py
    │   │   ├── user_address.py
    │   │   ├── user_ratings.py
    │   │   ├── user_reviews.py
    │   │   ├── user_roles.py
    │   │   ├── user_status.py
    │   │   ├── wishlists.py
    │   │   ├── wishlist_items.py
    │   │   └── __init__.py
    │   ├── models/
    │   │   ├── contact_us.py
    │   │   ├── login_logs.py
    │   │   ├── logout_logs.py
    │   │   ├── register_logs.py
    │   │   └── __init__.py
    │   ├── middleware/
    │   │   ├── error_handler.py
    │   │   └── logging.py
    │   ├── crud/
    │   │   ├── about.py
    │   │   ├── backup_logs.py
    │   │   ├── brands.py
    │   │   ├── cards_1.py
    │   │   ├── cards_2.py
    │   │   ├── card_details.py
    │   │   ├── carts.py
    │   │   ├── cart_items.py
    │   │   ├── categories.py
    │   │   ├── contact_us.py
    │   │   ├── coupons.py
    │   │   ├── coupons_status.py
    │   │   ├── exchanges.py
    │   │   ├── exchange_status.py
    │   │   ├── faq.py
    │   │   ├── hero_images.py
    │   │   ├── how_it_works.py
    │   │   ├── logs.py
    │   │   ├── occasions.py
    │   │   ├── orders.py
    │   │   ├── order_items.py
    │   │   ├── order_status.py
    │   │   ├── payments.py
    │   │   ├── payment_status.py
    │   │   ├── payment_types.py
    │   │   ├── policies.py
    │   │   ├── products.py
    │   │   ├── product_images.py
    │   │   ├── product_types.py
    │   │   ├── restore_logs.py
    │   │   ├── returns.py
    │   │   ├── return_status.py
    │   │   ├── review_status.py
    │   │   ├── sessions.py
    │   │   ├── store_details.py
    │   │   ├── terms_and_conditions.py
    │   │   ├── testimonials.py
    │   │   ├── token_revocations.py
    │   │   ├── upi_details.py
    │   │   ├── users.py
    │   │   ├── user_address.py
    │   │   ├── user_ratings.py
    │   │   ├── user_reviews.py
    │   │   ├── user_roles.py
    │   │   ├── user_status.py
    │   │   ├── wishlists.py
    │   │   ├── wishlist_items.py
    │   │   └── __init__.py
    │   ├── core/
    │   │   ├── config.py
    │   │   ├── database.py
    │   │   ├── redis.py
    │   │   ├── security.py
    │   │   └── __init__.py
    │   └── api/
    │       ├── deps.py
    │       ├── __init__.py
    │       └── routers/
    │           ├── about.py
    │           ├── address.py
    │           ├── auth.py
    │           ├── backup_logs.py
    │           ├── brands.py
    │           ├── cards_1.py
    │           ├── cards_2.py
    │           ├── card_details.py
    │           ├── cart_items.py
    │           ├── categories.py
    │           ├── contact_us.py
    │           ├── coupons.py
    │           ├── coupons_status.py
    │           ├── dashboard.py
    │           ├── exchanges.py
    │           ├── exchange_status.py
    │           ├── faq.py
    │           ├── files.py
    │           ├── hero_images.py
    │           ├── how_it_works.py
    │           ├── logs.py
    │           ├── occasions.py
    │           ├── orders.py
    │           ├── order_items.py
    │           ├── order_status.py
    │           ├── payments.py
    │           ├── payment_status.py
    │           ├── payment_types.py
    │           ├── policies.py
    │           ├── products.py
    │           ├── product_images.py
    │           ├── product_types.py
    │           ├── restore_logs.py
    │           ├── returns.py
    │           ├── return_status.py
    │           ├── review_status.py
    │           ├── store_details.py
    │           ├── terms_and_conditions.py
    │           ├── testimonials.py
    │           ├── upi_details.py
    │           ├── users.py
    │           ├── user_address.py
    │           ├── user_ratings.py
    │           ├── user_reviews.py
    │           ├── user_roles.py
    │           ├── user_status.py
    │           ├── wishlist_items.py
    │           └── __init__.py
```

---

## 13) FULL API ENDPOINTS (Complete List)

> Base prefix: `${API_V1_PREFIX}` (default `/api/v1`).  
> Many endpoints require **Bearer access token**; some require RBAC permissions.

### 13.1 Root
- **GET /** → `{ "message": "<PROJECT_NAME> is running" }`

### 13.2 Auth
- **POST /auth/register**
- **POST /auth/login**  (JSON or form via Swagger)
- **POST /auth/token/refresh**
- **POST /auth/logout**
- **POST /auth/change-password**
- **POST /auth/forgot-password/request**
- **POST /auth/forgot-password/verify**

### 13.3 Users
- **GET /users/profile**
- **PUT /users/profile-update** (multipart form; supports profile image upload)
- **POST /users/create-admin**
- **GET /users/**
- **GET /users/{user_id}**
- **PUT /users/{user_id}**
- **DELETE /users/{user_id}** (cascading in Mongo transaction: removes wishlist_items/cart_items then wishlists, carts, addresses, reviews; finally user)

### 13.4 Files (GridFS)
- **POST /files/upload**
- **GET /files/{file_id}**
- **DELETE /files/{file_id}**

### 13.5 Lookup Utilities
Each of these exposes standard CRUD:
- **POST /**, **GET /**, **GET /{id}**, **PUT /{id}**, **DELETE /{id}**

Resources:
- **/brands**
- **/product-types**
- **/occasions**
- **/categories**
- **/review-status**
- **/order-status**
- **/return-status**
- **/exchange-status**
- **/payment-types**
- **/payment-status**
- **/coupons-status**

### 13.6 CMS (Content)
All expose **POST /**, **GET /**, **GET /{id}**, **PUT /{id}**, **DELETE /{id}**

- **/hero-images**
- **/cards-1**
- **/cards-2**
- **/how-it-works**
- **/testimonials**
- **/about**
- **/policies**
- **/faq**
- **/terms**
- **/store-details**

### 13.7 Products
- **POST /products/**
- **GET /products/**
- **GET /products/{id}**
- **PUT /products/{id}**
- **DELETE /products/{id}**

### 13.8 Product Images
- **POST /product-images/**      (upload/attach via URL stored in Mongo; underlying bytes in GridFS)
- **GET /product-images/**       (list)
- **GET /product-images/{id}**   (read metadata)
- **PUT /product-images/{id}**
- **DELETE /product-images/{id}**

### 13.9 Wishlist Items
- **POST /wishlist-items/**
- **GET /wishlist-items/**
- **GET /wishlist-items/{id}**
- **PUT /wishlist-items/{id}**
- **DELETE /wishlist-items/{id}**

### 13.10 Cart Items
- **POST /cart-items/**
- **GET /cart-items/**
- **GET /cart-items/{id}**
- **PUT /cart-items/{id}**
- **DELETE /cart-items/{id}**

### 13.11 Addresses
- **/user-address** (user‑owned address book; CRUD)
  - **POST /user-address/**
  - **GET /user-address/**
  - **GET /user-address/{id}**
  - **PUT /user-address/{id}**
  - **DELETE /user-address/{id}**
- **/address** 
  - **GET /address/{pincode}**

### 13.12 Orders
- **POST /orders/**
- **GET /orders/**
- **GET /orders/{id}**
- **PUT /orders/{id}**
- **DELETE /orders/{id}**

### 13.13 Order Items
- **POST /order-items/**
- **GET /order-items/**
- **GET /order-items/{id}**
- **PUT /order-items/{id}**
- **DELETE /order-items/{id}**

### 13.14 Reviews & Ratings
- **Reviews (`/user-reviews`)**:
  - **POST /user-reviews/**
  - **GET /user-reviews/**
  - **GET /user-reviews/{id}**
  - **PUT /user-reviews/{id}**
  - **DELETE /user-reviews/{id}**
- **Ratings (`/user-ratings`)**:
  - **POST /user-ratings/**
  - **GET /user-ratings/**
  - **GET /user-ratings/{id}**
  - **PUT /user-ratings/{id}**
  - **DELETE /user-ratings/{id}**

### 13.15 Returns
- **POST /returns/**
- **GET /returns/**
- **GET /returns/{id}**
- **PUT /returns/{id}**
- **DELETE /returns/{id}**

### 13.16 Exchanges
- **POST /exchanges/**
- **GET /exchanges/**
- **GET /exchanges/{id}**
- **PUT /exchanges/{id}**
- **DELETE /exchanges/{id}**

### 13.17 Payments
- **/payments** (CRUD)
  - **POST /payments/**
  - **GET /payments/**
  - **GET /payments/{id}**
  - **PUT /payments/{id}**
  - **DELETE /payments/{id}**
- **/card-details** (CRUD; card number encrypted via `utils/crypto.py`)
  - **POST /card-details/**
  - **GET /card-details/**
  - **GET /card-details/{id}**
  - **PUT /card-details/{id}**
  - **DELETE /card-details/{id}**
- **/upi-details** (CRUD)
  - **POST /upi-details/**
  - **GET /upi-details/**
  - **GET /upi-details/{id}**
  - **PUT /upi-details/{id}**
  - **DELETE /upi-details/{id}**

### 13.18 Coupons
- **CRUD** under **/coupons**
  - **POST /coupons/**
  - **GET /coupons/**
  - **GET /coupons/{id}**
  - **PUT /coupons/{id}**
  - **DELETE /coupons/{id}**
- **Special Validation**
  - **POST /coupons/validate** → body: `{ code, amount }` → returns `{ valid, discount_amount, final_amount, reason }`

### 13.19 Backups & Restores
- **/backup-logs** (CRUD): track status/scope/frequency/path, timestamps for scheduled/started/finished
- **/restore-logs** (CRUD): status + `backup_id` reference

### 13.20 Contact Us (PostgreSQL)
- **/contact-us** (CRUD)

### 13.21 Logs (PostgreSQL)
- **/logs** (CRUD)

### 13.22 Dashboard (Analytics)
- **GET /dashboard/overview** — Totals (users, products, orders, returns, exchanges), revenue
- **GET /dashboard/sales?days=30** — Sales/revenue time series
- **GET /dashboard/user-growth?days=30** — New users per day
- **GET /dashboard/top-products?limit=10** — Top products by qty/revenue
- **GET /dashboard/low-stock?threshold=10** — Low inventory list
- **GET /dashboard/system-health** — Last backup date, failed backup/restore counts in recent window

---

## 14) Security Model (Concise)

- **Password Hashing:** `passlib` with `bcrypt_sha256` (backwards compatible with `bcrypt`).
- **Access Token:** short‑lived JWT, decoded with `JWT_ACCESS_TOKEN_SECRET`.
- **Refresh Token:** long‑lived, HTTP‑only cookie; rotation enforced; revocations persisted.
- **RBAC:** Mongo collections `permissions` + `role_permissions`; cached in Redis via `get_cached_policy`/`set_cached_policy` with TTL.
- **Mongo Transactions:** used for destructive cascades (e.g., user deletion cleaning child docs).
- **Uploads:** content‑type and size validated before streaming to GridFS.
- **Emails:** SMTP via `fastapi-mail`; HTML OTP template with expiry notice.

---

## 15) Troubleshooting

| Symptom | Likely Cause | Fix |
|--------|---------------|-----|
| `401 Unauthorized` | Missing/expired/invalid Bearer token | Login again; use fresh `access_token` |
| Refresh fails | Revoked/expired refresh cookie | Login again; cookie rotated on use |
| `415 Unsupported Media Type` | Upload content-type not allowed | Ensure `UPLOAD_ALLOWED_TYPES` includes it |
| Redis miss on permissions | Cache cold/expired | First access will fetch from Mongo and cache |
| Mongo command errors in seed | Existing indexes with different options | Seed handles error code 85; safe to re-run |
| PostgreSQL tables missing | Bad URI or no create-all | Check `POSTGRESQL_URI`; tables created at startup |
| Email not sending | SMTP credentials/ports wrong | Verify `.env` mail settings & less secure app rules |

---

## 16) Development Guidelines (Brief)

- Follow PEP8/ruff/black where applicable.
- Commit style: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
- Keep routers thin; put business logic in `services/`; low‑level access in `crud/`.
- Add indexes before shipping new collections; prefer safe creation patterns.

---

## 17) License & Contact

- **Author:** Lokesh Chirumamilla
- **Email:** lokeshchirumamilla2104@gmail.com
- **Project:** True Style (FastAPI backend)