# True Style API Documentation

**Version:** 0.1.0

**Generated on:** 2025-11-11 00:34:38


---
API Documentation
---


## `/api/v1/auth/register`

### POST: Register

**Description:** Register a new user account.

Args:
    payload (RegisterIn): User registration input data.

Returns:
    UserOut: Created user object.

**Tags:** Auth


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---


## `/api/v1/auth/login`

### POST: Login

**Description:** Authenticate user credentials and issue access + refresh tokens.

Supports:
  - Standard JSON login request body
  - `application/x-www-form-urlencoded` for Swagger UI

Args:
    response (Response): Used to set refresh cookie.
    request (Request): Incoming HTTP request.
    body (LoginIn | None): Login body from frontend.
    form_data (OAuth2PasswordRequestForm): Login from Swagger (username/password).

Returns:
    LoginResponse: Access token, user info and refresh cookie.

**Tags:** Auth


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/auth/token/refresh`

### POST: Token Refresh

**Description:** Rotate access token using a valid refresh token stored in cookies.

Args:
    response (Response): Used to update the refresh cookie.
    request (Request): HTTP request.
    rt (str | None): Refresh token from cookie.

Returns:
    TokenRotatedOut: New access and refresh token (rotated).

**Tags:** Auth


**Parameters:**

- `rt` (cookie) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/auth/logout`

### POST: Logout

**Description:** Logout user by revoking access + refresh tokens and clearing cookie.

Args:
    response (Response): Clears cookie.
    request (Request)
    token (str): Access token sent in Authorization header.
    rt (str | None): Refresh token from cookie.

Returns:
    MessageOut: Confirmation message.

**Tags:** Auth


**Parameters:**

- `rt` (cookie) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/auth/change-password`

### POST: Change Password

**Description:** Change the password of the currently authenticated user.

Args:
    body (ChangePasswordIn): Contains old and new password.
    current: Current authenticated user.

Returns:
    MessageOut: Confirmation message.

**Tags:** Auth


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/auth/forgot-password/request`

### POST: Forgot Password Request

**Description:** Initiate forgot-password flow by sending OTP/email link.

Args:
    body (ForgotPasswordRequestIn): Email or username.

Returns:
    MessageOut: Status message.

**Tags:** Auth


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/auth/forgot-password/verify`

### POST: Forgot Password Verify

**Description:** Verify OTP/token and allow password reset.

Args:
    body (ForgotPasswordVerifyIn): Email, OTP, and new password.

Returns:
    MessageOut: Confirmation message.

**Tags:** Auth


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/users/profile`

### GET: Get Profile

**Description:** Get the currently logged-in user's profile.

Returns:
    UserOut: Profile details of the authenticated user.

**Tags:** Users


**Responses:**

- `200` — Successful Response


---


## `/api/v1/users/profile-update`

### PUT: Update User

**Description:** Update the logged-in user's profile.
Supports optional profile image upload.

Args:
    current_user: The authenticated user context.
    user_status_id: Optional new user_status_id.
    first_name, last_name, email, phone_no, country_code: Updatable fields.
    image: Optional new profile image.

Returns:
    UserOut: Updated user details.

**Tags:** Users


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/users/create-admin`

### POST: Create User

**Description:** Create a new user with admin privileges.

Args:
    payload (RegisterIn): Registration data.

Returns:
    UserOut: Newly created admin user.

**Tags:** Users


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---


## `/api/v1/users/`

### GET: List Users

**Description:** List users with optional filtering.

Args:
    skip: Pagination offset.
    limit: Max results.
    role_id: Filter by role.
    user_status_id: Filter by status.

Returns:
    List[UserOut]: User list.

**Tags:** Users


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `role_id` (query) — 

- `user_status_id` (query) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/users/{user_id}`

### GET: Get User

**Description:** Get details for a specific user.

Raises:
    HTTPException 404: If user does not exist.

**Tags:** Users


**Parameters:**

- `user_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update User

**Description:** Update a user's status (admin only).

Args:
    user_id: Target user.
    user_status_id: New status.

Returns:
    UserOut: Updated user details.

**Tags:** Users


**Parameters:**

- `user_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete User

**Description:** Delete a user (admin only).

Raises:
    HTTPException 404: If user not found.

**Tags:** Users


**Parameters:**

- `user_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/files/{file_id}`

### GET: Download File

**Description:** Download a stored file by its GridFS/ObjectId identifier.

Args:
    file_id (PyObjectId): The unique ObjectId of the file to retrieve.

Returns:
    StreamingResponse: The raw file stream plus correct headers
    (content-type and content-disposition) for download.

Raises:
    HTTPException 404: If no file exists for the provided ObjectId.
    HTTPException 500: If file retrieval fails unexpectedly.

**Tags:** Files


**Parameters:**

- `file_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/brands/`

### POST: Create Item

**Description:** 

**Tags:** Utility


**Request Body Example:**


**Responses:**

- `201` — Brand created

- `400` — Validation error

- `403` — Forbidden

- `409` — Duplicate brand

- `500` — Server error

- `422` — Validation Error


---

### GET: List Items

**Description:** 

**Tags:** Utility


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `name` (query) — Exact match filter for brand name

- `q` (query) — Case-insensitive search on name


**Responses:**

- `200` — List of brands

- `400` — Validation error

- `500` — Server error

- `422` — Validation Error


---


## `/api/v1/brands/{item_id}`

### GET: Get Item

**Description:** 

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Brand

- `404` — Not found

- `500` — Server error

- `422` — Validation Error


---

### PUT: Update Item

**Description:** 

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Updated brand

- `400` — Validation error / no fields

- `404` — Not found

- `409` — Duplicate brand

- `500` — Server error

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** 

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Deleted

- `404` — Not found

- `500` — Server error

- `422` — Validation Error


---


## `/api/v1/product-types/`

### POST: Create Item

**Description:** Create a ProductType.

- Uploads both `size_chart` and `thumbnail` to GridFS.
- Persists their URLs in the ProductType document.

Args:
    type: Product type label (e.g., "t-shirt").
    size_chart: Required size chart file.
    thumbnail: Required thumbnail image.

Returns:
    ProductTypesOut

**Tags:** Utility, Product-Types


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Items

**Description:** List product types with pagination.

Args:
    skip: Pagination offset.
    limit: Page size.

Returns:
    List[ProductTypesOut]

**Tags:** Utility, Product-Types


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/product-types/{item_id}`

### GET: Get Item

**Description:** Get a single ProductType by id.

Args:
    item_id: ProductTypes ObjectId.

Returns:
    ProductTypesOut

Raises:
    404 if not found.

**Tags:** Utility, Product-Types


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update Item

**Description:** Update a ProductType.

- Optionally replaces `size_chart` and/or `thumbnail` in GridFS and updates URLs.
- Updates `type` label if provided.

Args:
    item_id: ProductTypes ObjectId.
    type: Optional new type label.
    size_chart: Optional new size chart file.
    thumbnail: Optional new thumbnail file.

Returns:
    ProductTypesOut

Raises:
    400 if no fields provided.
    404 if not found.
    409 on duplicate key (e.g., type).

**Tags:** Utility, Product-Types


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** Delete a ProductType if unused; then best-effort cleanup its GridFS files.

Args:
    item_id: ProductTypes ObjectId.

Returns:
    JSONResponse({"deleted": True})

Raises:
    400 if invalid / in-use.
    404 if not found.

**Tags:** Utility, Product-Types


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/occasions/`

### POST: Create Item

**Description:** Create a new occasion.

Args:
    payload: OccasionsCreate schema.

Returns:
    OccasionsOut

**Tags:** Utility


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Items

**Description:** List occasions with pagination and optional filters.

Args:
    skip: Pagination offset.
    limit: Page size.
    occasion: Exact match filter.
    q: Fuzzy (regex) search on `occasion`.

Returns:
    List[OccasionsOut]

**Tags:** Utility


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `occasion` (query) — Filter by exact occasion

- `q` (query) — Case-insensitive fuzzy search on occasion


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/occasions/{item_id}`

### GET: Get Item

**Description:** Get a single occasion by ID.

Args:
    item_id: Occasion ObjectId.

Returns:
    OccasionsOut

Raises:
    404 if not found.

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update Item

**Description:** Update an occasion.

Args:
    item_id: Occasion ObjectId.
    payload: OccasionsUpdate schema (must contain at least one field).

Returns:
    OccasionsOut

Raises:
    400 if no fields provided.
    404 if not found.
    409 on duplicate occasion.

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** Transactionally delete an occasion and all its products + related documents.
After commit, best-effort delete all related GridFS files (product thumbnails + product_images).

Args:
    item_id: Occasion ObjectId.

Returns:
    JSONResponse: {"deleted": True, "stats": {...}, "file_cleanup_warnings": [...]?}

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/categories/`

### POST: Create Item

**Description:** Create a new category.

Args:
    payload (CategoriesCreate): Schema containing category creation fields.

Returns:
    CategoriesOut: The newly created category record.

Raises:
    HTTPException: 409 if duplicate, 500 on server error.

**Tags:** Utility


**Request Body Example:**


**Responses:**

- `201` — Category created

- `400` — Validation error

- `403` — Forbidden

- `409` — Duplicate category

- `500` — Server error

- `422` — Validation Error


---

### GET: List Items

**Description:** List categories with pagination and optional search filters.

Args:
    skip (int): Pagination offset.
    limit (int): Number of records to return.
    category (str, optional): Exact match filter.
    q (str, optional): Regex fuzzy search.

Returns:
    List[CategoriesOut]: Paginated list of categories.

**Tags:** Utility


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `category` (query) — Exact match filter

- `q` (query) — Case-insensitive fuzzy search


**Responses:**

- `200` — List of categories

- `400` — Validation error

- `403` — Forbidden

- `500` — Server error

- `422` — Validation Error


---


## `/api/v1/categories/{item_id}`

### GET: Get Item

**Description:** Get a single category by ID.

Args:
    item_id (PyObjectId): Category ID.

Returns:
    CategoriesOut: Category record.

Raises:
    HTTPException: 404 if not found.

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Category

- `403` — Forbidden

- `404` — Not found

- `500` — Server error

- `422` — Validation Error


---

### PUT: Update Item

**Description:** Update a category.

Args:
    item_id (PyObjectId): ID of category to update.
    payload (CategoriesUpdate): Partial update fields.

Returns:
    CategoriesOut: Updated record.

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Updated category

- `400` — Validation error / no fields

- `403` — Forbidden

- `404` — Not found

- `409` — Duplicate category

- `500` — Server error

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** Delete a category and related products.
After deleting DB docs, performs a best-effort cleanup of stored images in GridFS.

Args:
    item_id (PyObjectId): Category ID.

Returns:
    JSONResponse: deletion result with optional warnings.

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Deleted

- `403` — Forbidden

- `404` — Not found

- `500` — Server error

- `422` — Validation Error


---


## `/api/v1/review-status/`

### POST: Create Item

**Description:** Create a new review status.

**Tags:** Utility


**Request Body Example:**


**Responses:**

- `201` — Review status created

- `400` — Validation error

- `403` — Forbidden

- `409` — Duplicate

- `500` — Server error

- `422` — Validation Error


---

### GET: List Items

**Description:** List review statuses with optional exact-status filter.

**Tags:** Utility


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `status_q` (query) — Filter by status (exact match)


**Responses:**

- `200` — List of review statuses

- `400` — Validation error

- `403` — Forbidden

- `500` — Server error

- `422` — Validation Error


---


## `/api/v1/review-status/{item_id}`

### GET: Get Item

**Description:** Get a single review status by id.

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Review status

- `403` — Forbidden

- `404` — Not found

- `500` — Server error

- `422` — Validation Error


---

### PUT: Update Item

**Description:** Update fields of a review status.

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Updated review status

- `400` — Validation error / no fields

- `403` — Forbidden

- `404` — Not found

- `409` — Duplicate

- `500` — Server error

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** Delete a review status (blocked if referenced by reviews).

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Deleted

- `400` — In use / invalid ID

- `403` — Forbidden

- `404` — Not found

- `500` — Server error

- `422` — Validation Error


---


## `/api/v1/order-status/`

### POST: Create Item

**Description:** Create an order status.

Args:
    payload: OrderStatusCreate schema.

Returns:
    OrderStatusOut

Raises:
    409 on duplicate status (if a unique index exists).

**Tags:** Utility


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Items

**Description:** List order statuses with optional exact `status` filter.

Args:
    skip: Pagination offset.
    limit: Page size.
    status_q: Optional exact match on status field.

Returns:
    List[OrderStatusOut]

**Tags:** Utility


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `status_q` (query) — Filter by exact status


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/order-status/{item_id}`

### GET: Get Item

**Description:** Get a single order status by id.

Args:
    item_id: Order status ObjectId.

Returns:
    OrderStatusOut

Raises:
    404 if not found.

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update Item

**Description:** Update an order status.

Args:
    item_id: Order status ObjectId.
    payload: OrderStatusUpdate schema (must include at least one field).

Returns:
    OrderStatusOut

Raises:
    400 if no fields provided.
    404 if not found.
    409 on duplicate status/index.

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** Delete an order status.

Delete semantics (as per CRUD contract):
  - Returns 400 if ID is invalid (ok is None).
  - Returns 400 if the status is in use by one or more orders (ok is False).
  - Returns 200 with {"deleted": True} on success.

Args:
    item_id: Order status ObjectId.

Returns:
    JSONResponse({"deleted": True})

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/return-status/`

### POST: Create Item

**Description:** Create new return status.

**Tags:** Utility


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Items

**Description:** List return statuses with optional filter.

**Tags:** Utility


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `status_q` (query) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/return-status/{item_id}`

### GET: Get Item

**Description:** Get a single return status by id.

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update Item

**Description:** Update a return status.

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** Delete a return status (protected if in use).

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/exchange-status/`

### POST: Create Item

**Description:** Create a new exchange status.

Args:
    payload: Fields for the exchange status.

Returns:
    ExchangeStatusOut: Newly created record.

Raises:
    HTTPException: 409 if duplicate, 500 otherwise.

**Tags:** Utility


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Items

**Description:** List all exchange statuses with pagination and optional filtering.

Args:
    skip: Offset for pagination.
    limit: Number of records to return.
    status_q: Exact match on status string.

Returns:
    List[ExchangeStatusOut]

**Tags:** Utility


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `status_q` (query) — Filter by exact status


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/exchange-status/{item_id}`

### GET: Get Item

**Description:** Retrieve a single exchange status by ID.

Args:
    item_id: ObjectId of the status.

Returns:
    ExchangeStatusOut

Raises:
    404 if not found

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update Item

**Description:** Update a status record.

Args:
    item_id: Record ID.
    payload: Fields to update.

Returns:
    ExchangeStatusOut

Raises:
    400 No fields
    404 Not found
    409 Duplicate idx or status

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** Delete a status.

CRUD contract:
  - None => not found
  - False => status is in use (cannot delete)
  - True => deleted

Returns:
    JSONResponse({"deleted": True}) on success.

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/payment-types/`

### POST: Create Item

**Description:** Create a payment type.

Args:
    payload: PaymentTypesCreate.

Returns:
    PaymentTypesOut

Raises:
    409 on duplicate (idx or type), if unique index exists.

**Tags:** Utility


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Items

**Description:** List payment types with optional exact `type` filter.

Args:
    skip: Pagination offset.
    limit: Page size.
    type_q: Optional exact match on the `type` field.

Returns:
    List[PaymentTypesOut]

**Tags:** Utility


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `type_q` (query) — Filter by exact type


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/payment-types/{item_id}`

### GET: Get Item

**Description:** Get a single payment type by id.

Args:
    item_id: Payment type ObjectId.

Returns:
    PaymentTypesOut

Raises:
    404 if not found.

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update Item

**Description:** Update a payment type.

Args:
    item_id: Payment type ObjectId.
    payload: PaymentTypesUpdate (must include at least one field).

Returns:
    PaymentTypesOut

Raises:
    400 if no fields provided.
    404 if not found.
    409 on duplicate (idx or type).

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** Delete a payment type.

Delete semantics (per CRUD contract):
  - If `ok is None`: ID invalid → 400.
  - If `ok is False`: type in use by payments → 400.
  - If `ok is True`: return 200 with {"deleted": True}.

Args:
    item_id: Payment type ObjectId.

Returns:
    JSONResponse({"deleted": True})

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/payment-status/`

### POST: Create Item

**Description:** Create a payment status.

Args:
    payload: PaymentStatusCreate.

Returns:
    PaymentStatusOut

Raises:
    409 on duplicate key (idx or status), if unique index exists.

**Tags:** Utility


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Items

**Description:** List payment statuses with optional exact `status` filter.

Args:
    skip: Offset.
    limit: Limit.
    status_q: Optional exact status match.

Returns:
    List[PaymentStatusOut]

**Tags:** Utility


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `status_q` (query) — Filter by exact status


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/payment-status/{item_id}`

### GET: Get Item

**Description:** Get a single payment status by id.

Args:
    item_id: Payment status ObjectId.

Returns:
    PaymentStatusOut

Raises:
    404 if not found.

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update Item

**Description:** Update a payment status.

Args:
    item_id: Payment status ObjectId.
    payload: PaymentStatusUpdate (must contain at least one field).

Returns:
    PaymentStatusOut

Raises:
    400 if no fields provided.
    404 if not found.
    409 on duplicate (idx or status).

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** Delete a payment status.

Delete semantics (per CRUD contract):
  - If `ok is None`: ID invalid → 400.
  - If `ok is False`: status in use by payments → 400.
  - If `ok is True`: return 200 with {"deleted": True}.

Args:
    item_id: Payment status ObjectId.

Returns:
    JSONResponse({"deleted": True})

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/coupons-status/`

### POST: Create Item

**Description:** Create a coupons status record.

Args:
    payload: Fields for the coupons status (e.g., idx, status).

Returns:
    CouponsStatusOut: The newly created record.

Raises:
    HTTPException:
        - 409 if a duplicate key (e.g., status) exists.
        - 500 on server error.

**Tags:** Utility


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Items

**Description:** List coupons status records with optional exact status filter.

Args:
    skip: Pagination offset.
    limit: Page size.
    status_q: Exact status string to filter by.

Returns:
    List[CouponsStatusOut]: Paginated list of status records.

Raises:
    HTTPException: 500 on server error.

**Tags:** Utility


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `status_q` (query) — Filter by exact status


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/coupons-status/{item_id}`

### GET: Get Item

**Description:** Get a single coupons status record by its ID.

Args:
    item_id: Coupons status ObjectId.

Returns:
    CouponsStatusOut: The matching record.

Raises:
    HTTPException:
        - 404 if not found.
        - 500 on server error.

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update Item

**Description:** Update fields of a coupons status record.

Args:
    item_id: Record ID.
    payload: Partial update fields.

Returns:
    CouponsStatusOut: Updated record.

Raises:
    HTTPException:
        - 400 if no fields provided.
        - 404 if not found.
        - 409 on duplicate (idx or status).
        - 500 on server error.

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** Delete a coupons status record.

Deletion outcomes from CRUD:
  - None: invalid ID → 400
  - False: in-use by one or more coupons → 400
  - True: deleted → 200

Args:
    item_id: Record ID.

Returns:
    JSONResponse: {"deleted": True} on success.

Raises:
    HTTPException:
        - 400 for invalid ID or when status is in use.
        - 500 on server error.

**Tags:** Utility


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/hero-images/`

### POST: Create Item

**Description:** Create a hero image.

Notes:
- Image (if provided) is streamed to GridFS; resulting `image_url` is stored.
- Business rule: image is required; service returns 400 if omitted.

Args:
    idx: Display order.
    image: Image file to upload (required by business rule).

Returns:
    HeroImagesOut: Newly created hero image.

**Tags:** Content


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Items

**Description:** List hero images with pagination.

Args:
    skip: Offset for pagination.
    limit: Page size.
    sort_by_idx: Whether to sort by ascending `idx`.

Returns:
    List[HeroImagesOut]

**Tags:** Content


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `sort_by_idx` (query) — Sort by idx asc; fallback createdAt desc


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/hero-images/{item_id}`

### GET: Get Item

**Description:** Get a hero image by ID.

Args:
    item_id: Hero image ObjectId.

Returns:
    HeroImagesOut

Raises:
    404 if not found.

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update Item

**Description:** Update `idx` and/or replace image.

If `image` is provided, the old GridFS image is replaced and `image_url` updated.

Args:
    item_id: Hero image ObjectId.
    idx: Optional new index.
    image: Optional new image file.

Returns:
    HeroImagesOut

Raises:
    400 if no fields provided.
    404 if not found.
    409 on duplicate idx (if unique index exists).

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** Delete a hero image and its GridFS file if present.

Args:
    item_id: Hero image ObjectId.

Returns:
    JSONResponse: {"deleted": True}

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/cards-1/`

### POST: Create Item

**Description:** Create a new Cards1 item. Image is streamed into GridFS; image_url is stored.

**Tags:** Content


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Items

**Description:** 

**Tags:** Content


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `sort_by_idx` (query) — Sort by idx asc; fallback createdAt desc


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/cards-1/{item_id}`

### GET: Get Item

**Description:** 

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update Item

**Description:** Update fields; if image is provided, replace it in GridFS and update image_url.

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** 

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/cards-2/`

### POST: Create Item

**Description:** Create a new Cards2 item. Streams the image to GridFS and stores the resulting image_url.

**Tags:** Content


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Items

**Description:** 

**Tags:** Content


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `sort_by_idx` (query) — Sort by idx asc; fallback createdAt desc


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/cards-2/{item_id}`

### GET: Get Item

**Description:** 

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update Item

**Description:** Update mutable fields; if a new image is provided, replace it in GridFS and update image_url.

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** 

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/how-it-works/`

### POST: Create Item

**Description:** Create a How-It-Works entry.

Notes:
- If `image` is provided, it will be streamed to GridFS and `image_url` stored.
- Business rule: image is required; the service returns 400 if omitted.

Args:
    idx: Display/index order.
    title: Card title.
    image: Image file to upload (required by business rule).

Returns:
    HowItWorksOut

**Tags:** Content


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Items

**Description:** List How-It-Works entries with pagination.

Args:
    skip: Offset for pagination.
    limit: Page size.
    sort_by_idx: Whether to sort by idx ascending.

Returns:
    List[HowItWorksOut]

**Tags:** Content


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `sort_by_idx` (query) — Sort by idx asc; fallback createdAt desc


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/how-it-works/{item_id}`

### GET: Get Item

**Description:** Get a single How-It-Works entry by ID.

Args:
    item_id: ObjectId of the entry.

Returns:
    HowItWorksOut

Raises:
    404 if not found.

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update Item

**Description:** Update `idx`/`title`; if `image` is provided, the old GridFS file is replaced and `image_url` updated.

Args:
    item_id: Entry ObjectId.
    idx: Optional new display order.
    title: Optional new title.
    image: Optional new image file.

Returns:
    HowItWorksOut

Raises:
    400 if no fields provided.
    404 if not found.
    409 on duplicate idx (if unique).

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** Delete an entry and its GridFS image if present.

Args:
    item_id: Entry ObjectId.

Returns:
    JSONResponse: {"deleted": True}

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/testimonials/`

### POST: Create Item

**Description:** Route: create testimonial (handles file upload via service).

**Tags:** Content


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Items

**Description:** Route: list testimonials with optional sorting.

**Tags:** Content


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `sort_by_idx` (query) — Sort by idx asc; fallback createdAt desc


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/testimonials/{item_id}`

### GET: Get Item

**Description:** Route: fetch single testimonial by id.

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update Item

**Description:** Route: update testimonial fields and/or image.

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** Route: delete testimonial and best-effort remove the GridFS file afterwards.

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/about/`

### POST: Create Item

**Description:** 

**Tags:** Content


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Items

**Description:** 

**Tags:** Content


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/about/{item_id}`

### GET: Get Item

**Description:** 

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update Item

**Description:** 

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** 

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/policies/`

### POST: Create Item

**Description:** Create a policy: upload image to GridFS and store the resulting image_url.

Args:
    idx: Display/order index.
    title: Policy title.
    description: Policy description.
    image: Image file to store in GridFS.

Returns:
    PoliciesOut

**Tags:** Content


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Items

**Description:** List policies with pagination.

Args:
    skip: Pagination offset.
    limit: Page size.
    sort_by_idx: If True, sort by idx ascending; otherwise fallback to createdAt desc.

Returns:
    List[PoliciesOut]

**Tags:** Content


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `sort_by_idx` (query) — Sort by idx asc; fallback createdAt desc


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/policies/{item_id}`

### GET: Get Item

**Description:** Get a single policy by id.

Args:
    item_id: Policy ObjectId.

Returns:
    PoliciesOut

Raises:
    404 if not found.

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update Item

**Description:** Update idx/title/description; if an image is provided, replace it in GridFS and update image_url.

Args:
    item_id: Policy ObjectId.
    idx: Optional new idx.
    title: Optional new title.
    description: Optional new description.
    image: Optional new image file (GridFS). Use File(None) to show upload control in docs.

Returns:
    PoliciesOut

Raises:
    400 if no fields provided.
    404 if not found.
    409 on duplicate idx (if unique index).

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** Delete a policy; if it has a GridFS image, delete the file too.

Args:
    item_id: Policy ObjectId.

Returns:
    JSONResponse({"deleted": True})

Raises:
    404 if not found.

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/faq/`

### POST: Create Item

**Description:** Create an FAQ entry.

Notes:
- If `image` is provided, it will be streamed to GridFS and the `image_url` stored.
- Current schema expects an image; we enforce presence with a 400 if `image` is omitted.

Args:
    idx: Display/index order.
    question: Question text.
    answer: Answer text.
    image: Optional file upload; required by business rules.

Returns:
    FaqOut: Newly created FAQ.

**Tags:** Content


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Items

**Description:** List FAQs with pagination.

Args:
    skip: Offset for pagination.
    limit: Page size.
    sort_by_idx: Whether to sort by idx ascending.

Returns:
    List[FaqOut]

**Tags:** Content


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `sort_by_idx` (query) — Sort by idx asc; fallback createdAt desc


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/faq/{item_id}`

### GET: Get Item

**Description:** Get a single FAQ by its ID.

Args:
    item_id: FAQ ObjectId.

Returns:
    FaqOut

Raises:
    404 if not found.

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update Item

**Description:** Update FAQ fields. If `image` is provided, the old GridFS image is replaced and `image_url` updated.

Args:
    item_id: FAQ ObjectId.
    idx: New display order.
    question: New question text.
    answer: New answer text.
    image: Optional new image file to replace the existing one.

Returns:
    FaqOut

Raises:
    400 if no fields provided.
    404 if not found.
    409 on duplicate idx.

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** Delete an FAQ and its GridFS image if present.

Args:
    item_id: FAQ ObjectId.

Returns:
    JSONResponse: {"deleted": True}

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/terms/`

### POST: Create Item

**Description:** Route: create Terms & Conditions.

**Tags:** Content


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Items

**Description:** Route: list Terms & Conditions with optional sorting.

**Tags:** Content


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `sort_by_idx` (query) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/terms/{item_id}`

### GET: Get Item

**Description:** Route: get a single Terms & Conditions document.

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update Item

**Description:** Route: update Terms & Conditions.

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** Route: delete Terms & Conditions.

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/store-details/`

### POST: Create Item

**Description:** Route: create store details.

**Tags:** Content


**Request Body Example:**


**Responses:**

- `201` — Store details created

- `400` — Validation error

- `403` — Forbidden

- `409` — Duplicate (PAN/GST)

- `500` — Server error

- `422` — Validation Error


---

### GET: List Items

**Description:** Route: list store details with pagination.

**Tags:** Content


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 


**Responses:**

- `200` — List of store details

- `403` — Forbidden

- `500` — Server error

- `422` — Validation Error


---


## `/api/v1/store-details/{item_id}`

### GET: Get Item

**Description:** Route: get a single store details doc.

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Store details

- `403` — Forbidden

- `404` — Not found

- `500` — Server error

- `422` — Validation Error


---

### PUT: Update Item

**Description:** Route: update store details.

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Updated store details

- `400` — Validation error / no fields

- `403` — Forbidden

- `404` — Not found

- `409` — Duplicate (PAN/GST)

- `500` — Server error

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** Route: delete store details.

**Tags:** Content


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Deleted

- `400` — Invalid ID

- `403` — Forbidden

- `404` — Not found

- `500` — Server error

- `422` — Validation Error


---


## `/api/v1/products/`

### POST: Create Item

**Description:** Create a product.

- Validates numeric ranges.
- Ensures thumbnail file is provided.
- Uploads thumbnail to GridFS and persists URL.
- Marks `out_of_stock=True` if `quantity==0`.

Returns:
    ProductsOut

**Tags:** Products


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Items

**Description:** List products with rich filters and pagination.

Notes:
    - Validates min_price/max_price relationship.

**Tags:** Products


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `q` (query) — Search name/description (case-insensitive)

- `brand_id` (query) — 

- `category_id` (query) — 

- `occasion_id` (query) — 

- `product_type_id` (query) — 

- `color` (query) — 

- `out_of_stock` (query) — 

- `min_price` (query) — 

- `max_price` (query) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/products/{item_id}`

### GET: Get Item

**Description:** Get a single product by id.

Raises:
    404 if not found.

**Tags:** Products


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update Item

**Description:** Update product fields.

- Validates numeric ranges.
- If `thumbnail` provided, replaces GridFS file and updates `thumbnail_url`.
- Keeps `out_of_stock` in sync with `quantity` when one is provided without the other.

**Tags:** Products


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** Cascade delete a product and related documents.
After commit, performs best-effort GridFS cleanup of associated images.

Returns:
    JSONResponse({"deleted": True, "file_cleanup_warnings": [...]?})

**Tags:** Products


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/product-images/`

### POST: Create Item

**Description:** Create a ProductImages document.

- Streams the file into GridFS and stores `image_url`.
- `product_id` is validated as an ObjectId by PyObjectId.

Args:
    product_id: Target product's ObjectId.
    image: Image file to upload (required).

Returns:
    ProductImagesOut

**Tags:** Products


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Items

**Description:** List product images with optional filter by product.

Args:
    skip: Pagination offset.
    limit: Page size.
    product_id: Optional product filter.

Returns:
    List[ProductImagesOut]

**Tags:** Products


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `product_id` (query) — Filter by product ObjectId


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/product-images/{item_id}`

### GET: Get Item

**Description:** Get a single ProductImages doc by id.

Args:
    item_id: ProductImages ObjectId.

Returns:
    ProductImagesOut

Raises:
    404 if not found.

**Tags:** Products


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update Item

**Description:** Update `product_id` and/or replace the image in GridFS.

Args:
    item_id: ProductImages ObjectId.
    product_id: Optional new product id.
    image: Optional new image file.

Returns:
    ProductImagesOut

Raises:
    400 if no fields provided.
    404 if not found.
    409 on generic update conflict.

**Tags:** Products


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** Delete the ProductImages document and best-effort remove its GridFS file.

Args:
    item_id: ProductImages ObjectId.

Returns:
    JSONResponse({"deleted": True})

Raises:
    404 if not found.

**Tags:** Products


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/wishlist-items/`

### POST: Create Item

**Description:** 

**Tags:** Wishlists


**Parameters:**

- `product_id` (query) — 


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Items

**Description:** 

**Tags:** Wishlists


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `product_id` (query) — Filter by product_id


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/wishlist-items/{item_id}`

### GET: Get Item

**Description:** 

**Tags:** Wishlists


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** 

**Tags:** Wishlists


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/wishlist-items/move-to-cart/{item_id}`

### POST: Move Item

**Description:** 

**Tags:** Wishlists


**Parameters:**

- `item_id` (path) — 

- `size` (query) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/cart-items/`

### POST: Create Item

**Description:** Create-or-merge:
  - If (cart_id, product_id, size) exists → increment quantity.
  - Else create a new line.

**Tags:** Carts


**Parameters:**

- `product_id` (query) — 

- `size` (query) — 

- `quantity` (query) — 


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Items

**Description:** 

**Tags:** Carts


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `product_id` (query) — Filter by product_id


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/cart-items/{item_id}`

### GET: Get Item

**Description:** 

**Tags:** Carts


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update Item

**Description:** 

**Tags:** Carts


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** 

**Tags:** Carts


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/cart-items/move-to-wishlist/{item_id}`

### POST: Move To Wishlist

**Description:** Moves a cart line into wishlist_items atomically:
  - Upsert wishlist_items by (wishlist_id, product_id)
  - Delete the cart line
Assumptions:
  - current_user contains "wishlist_id"
  - wishlist_items schema stores wishlist_id & product_id as ObjectId

**Tags:** Carts


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/user-address/`

### POST: Create Item

**Description:** 

**Tags:** Users


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Items

**Description:** 

**Tags:** Users


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/user-address/{item_id}`

### GET: Get Item

**Description:** 

**Tags:** Users


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update Item

**Description:** 

**Tags:** Users


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** 

**Tags:** Users


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/address/{pincode}`

### GET: Get Location

**Description:** Get location details for a given pincode.

Args:
    pincode (int): The pincode to lookup.

Returns:
    Dict: Location details returned by the service.

**Tags:** Users


**Parameters:**

- `pincode` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/orders/place-order`

### POST: Place Order

**Description:** Create an order for the current user.

Notes:
- Validates payment type and required payment details.
- Embeds address snapshot.
- Checks and decrements product stock atomically.
- Moves `cart_items` → `order_items`, creates payment (+ card/UPI details).
- Clears cart items.
- All writes occur in a single MongoDB transaction.

Returns:
    OrdersOut

**Tags:** Orders


**Parameters:**

- `user_id` (query) — 

- `address_id` (query) — 

- `payment_type_id` (query) — 

- `card_name` (query) — 

- `card_no` (query) — 

- `upi_id` (query) — 


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---


## `/api/v1/orders/my`

### GET: List My Orders

**Description:** List the current user's orders with pagination.

**Tags:** Orders


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/orders/my/{order_id}`

### GET: Get My Order

**Description:** Get one order owned by the current user (ownership enforced).

**Tags:** Orders


**Parameters:**

- `order_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/orders/{order_id}`

### GET: Admin Get Order

**Description:** Admin: get any order by id.

**Tags:** Orders


**Parameters:**

- `order_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Admin Delete Order

**Description:** Admin: transactionally delete one order and related documents:
  - order_items
  - payments
  - upi_details / card_details

**Tags:** Orders


**Parameters:**

- `order_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/orders/my/{order_id}/status`

### PUT: Update My Order Status

**Description:** User updates their own order status (if allowed by business policy).

Requires:
    payload.status_id not None

**Tags:** Orders


**Parameters:**

- `order_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/orders/{order_id}/status`

### PUT: Admin Update Order Status

**Description:** Admin: update `status_id`. Special handling:
  - If status is 'out for delivery' → generate and set a 6-digit OTP.
  - If status is 'delivered' → clear OTP.

**Tags:** Orders


**Parameters:**

- `order_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/order-items/my`

### GET: List My Items

**Description:** List order-items that belong to the current user, with optional filters.

Args:
    skip: Pagination offset.
    limit: Page size.
    order_id: Optional order filter.
    product_id: Optional product filter.
    current_user: Injected user context.

Returns:
    List[OrderItemsOut]

**Tags:** Orders


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `order_id` (query) — Filter by a specific order

- `product_id` (query) — Filter by a specific product


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/order-items/my/{item_id}`

### GET: Get My Item

**Description:** Get a single order-item if (and only if) it belongs to the current user.

Args:
    item_id: Order item ObjectId.
    current_user: Injected user context.

Returns:
    OrderItemsOut

Raises:
    404 if not found.
    403 if not owned by user.

**Tags:** Orders


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/order-items/`

### GET: List Items Admin

**Description:** Admin: list order-items with optional filters.

Args:
    skip: Pagination offset.
    limit: Page size.
    order_id: Optional order filter.
    user_id: Optional user filter.
    product_id: Optional product filter.

Returns:
    List[OrderItemsOut]

**Tags:** Orders


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `order_id` (query) — 

- `user_id` (query) — 

- `product_id` (query) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/order-items/{item_id}`

### GET: Get Item Admin

**Description:** Admin: get any single order-item by id.

Args:
    item_id: Order item ObjectId.

Returns:
    OrderItemsOut

Raises:
    404 if not found.

**Tags:** Orders


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/user-reviews/`

### POST: Create Item

**Description:** 

**Tags:** Reviews


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Items

**Description:** 

**Tags:** Reviews


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `product_id` (query) — 

- `user_id` (query) — 

- `review_status_id` (query) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/user-reviews/{item_id}`

### GET: Get Item

**Description:** 

**Tags:** Reviews


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update Item

**Description:** 

**Tags:** Reviews


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** 

**Tags:** Reviews


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/user-reviews/by-product/{product_id}/me`

### GET: Get My Review For Product

**Description:** 

**Tags:** Reviews


**Parameters:**

- `product_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/user-reviews/admin/by-status/{review_status_id}`

### GET: Admin List By Status

**Description:** 

**Tags:** Reviews


**Parameters:**

- `review_status_id` (path) — 

- `skip` (query) — 

- `limit` (query) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/user-reviews/admin/{item_id}/set-status/{review_status_id}`

### POST: Admin Set Status

**Description:** 

**Tags:** Reviews


**Parameters:**

- `item_id` (path) — 

- `review_status_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/user-reviews/admin/{item_id}`

### DELETE: Admin Force Delete

**Description:** 

**Tags:** Reviews


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/user-ratings/`

### POST: Create Item

**Description:** 

**Tags:** Ratings


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Items

**Description:** 

**Tags:** Ratings


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `product_id` (query) — Filter by product_id

- `user_id` (query) — Filter by user_id


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/user-ratings/{item_id}`

### GET: Get Item

**Description:** 

**Tags:** Ratings


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update Item

**Description:** 

**Tags:** Ratings


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** 

**Tags:** Ratings


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/user-ratings/by-product/{product_id}/me`

### GET: Get My Rating For Product

**Description:** 

**Tags:** Ratings


**Parameters:**

- `product_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/returns/`

### POST: Create Return

**Description:** Create a return for an order item owned by the current user.

Notes:
- Validates ownership and available quantity (ordered - already returned).
- Computes refund amount = unit_price * quantity.
- Sets return_status to 'requested'.
- If `image` is provided, uploads to GridFS and stores the URL.
- **Delivery date is auto-fetched** from the order and must be within the last 7 days.

Args:
    order_item_id: Target order item id.
    quantity: Number of units to return (must be > 0).
    reason: Optional user-provided reason.
    image: Optional photo evidence (stored in GridFS).
    current_user: Injected current user.

Returns:
    ReturnsOut: Newly created return record.

**Tags:** Returns


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: Admin List Returns

**Description:** Admin: list returns with optional filters.

Args:
    skip, limit: Pagination.
    user_id, order_id, product_id, return_status_id: Optional filters.

Returns:
    List[ReturnsOut]

**Tags:** Returns


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `user_id` (query) — 

- `order_id` (query) — 

- `product_id` (query) — 

- `return_status_id` (query) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/returns/my`

### GET: List My Returns

**Description:** List returns created by the current user.

Args:
    skip: Pagination offset.
    limit: Page size.
    current_user: Injected user.

Returns:
    List[ReturnsOut]

**Tags:** Returns


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/returns/my/{return_id}`

### GET: Get My Return

**Description:** Get a single return that belongs to the current user.

Args:
    return_id: Return ObjectId.
    current_user: Injected user.

Returns:
    ReturnsOut

Raises:
    403 if the return does not belong to the current user.

**Tags:** Returns


**Parameters:**

- `return_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/returns/{return_id}`

### GET: Admin Get Return

**Description:** Admin: get a return by ID.

Args:
    return_id: Return ObjectId.

Returns:
    ReturnsOut

**Tags:** Returns


**Parameters:**

- `return_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Admin Delete Return

**Description:** Admin: delete a return.

Args:
    return_id: Return ObjectId.

Returns:
    JSONResponse({"deleted": True})

**Tags:** Returns


**Parameters:**

- `return_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/returns/{return_id}/status`

### PUT: Admin Update Return Status

**Description:** Admin: update return status only.

Args:
    return_id: Return ObjectId.
    payload: ReturnsUpdate (expects return_status_id).

Returns:
    ReturnsOut

Raises:
    400 if return_status_id missing.

**Tags:** Returns


**Parameters:**

- `return_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/exchanges/`

### POST: Create Exchange

**Description:** Create an exchange for a single order item.

Notes:
- Derives `order_id` and `product_id` from `order_items`.
- Verifies the order belongs to the current user.
- Forces `exchange_status` to "requested".
- Enforces delivery window: delivery_date must be within the last 7 days (inclusive).

Args:
    order_item_id: The order item to exchange.
    reason: Optional reason provided by the user.
    image: Optional image to upload to GridFS.
    new_quantity: Desired quantity for the exchange.
    new_size: Desired size for the exchange (if applicable).
    delivery_date: The date the order was delivered (YYYY-MM-DD).
    current_user: Injected current user.

Returns:
    ExchangesOut: The created exchange.

**Tags:** Exchanges


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: Admin List Exchanges

**Description:** Admin: List exchanges with optional filters.

Args:
    skip: Pagination offset.
    limit: Page size.
    user_id: Filter by user.
    order_id: Filter by order.
    product_id: Filter by product.
    exchange_status_id: Filter by status id.

Returns:
    List[ExchangesOut]

**Tags:** Exchanges


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `user_id` (query) — 

- `order_id` (query) — 

- `product_id` (query) — 

- `exchange_status_id` (query) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/exchanges/my`

### GET: List My Exchanges

**Description:** List exchanges created by the current user.

Args:
    skip: Pagination offset.
    limit: Page size.
    current_user: Injected current user.

Returns:
    List[ExchangesOut]

**Tags:** Exchanges


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/exchanges/my/{item_id}`

### GET: Get My Exchange

**Description:** Get a single exchange created by the current user.

Args:
    item_id: Exchange ObjectId.
    current_user: Injected current user.

Returns:
    ExchangesOut

Raises:
    403 if the exchange does not belong to the current user.

**Tags:** Exchanges


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/exchanges/{item_id}`

### GET: Admin Get Exchange

**Description:** Admin: Get a single exchange by ID.

Args:
    item_id: Exchange ObjectId.

Returns:
    ExchangesOut

**Tags:** Exchanges


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Admin Delete Exchange

**Description:** Admin: Delete an exchange and remove its GridFS-backed image if present.

Args:
    item_id: Exchange ObjectId.

Returns:
    JSONResponse({"deleted": True})

**Tags:** Exchanges


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/exchanges/{item_id}/status`

### PUT: Admin Update Exchange Status

**Description:** Admin: Update exchange status only.

Args:
    item_id: Exchange ObjectId.
    payload: ExchangesUpdate (expects exchange_status_id).

Returns:
    ExchangesOut

Raises:
    400 if exchange_status_id missing.

**Tags:** Exchanges


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/payments/my`

### GET: List My Payments

**Description:** List payments that belong to the **current user**.

Args:
    skip: Pagination offset.
    limit: Page size.
    order_id: Optional filter for a specific order.
    invoice_no: Optional exact invoice number.
    current_user: Injected current user context.

Returns:
    List[PaymentsOut]

**Tags:** Payments


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `order_id` (query) — Filter by my specific order

- `invoice_no` (query) — Exact invoice number


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/payments/my/{payment_id}`

### GET: Get My Payment

**Description:** Get a single payment if it belongs to the current user.

Args:
    payment_id: Payment ObjectId.
    current_user: Injected current user context.

Returns:
    PaymentsOut

Raises:
    404 if not found.
    403 if the payment is not owned by the user.

**Tags:** Payments


**Parameters:**

- `payment_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/payments/`

### GET: List Payments Admin

**Description:** Admin: list payments with rich filters.

Args:
    skip: Pagination offset.
    limit: Page size.
    user_id: Optional filter.
    order_id: Optional filter.
    payment_types_id: Optional filter.
    payment_status_id: Optional filter.
    invoice_no: Optional exact invoice number.

Returns:
    List[PaymentsOut]

**Tags:** Payments


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `user_id` (query) — 

- `order_id` (query) — 

- `payment_types_id` (query) — 

- `payment_status_id` (query) — 

- `invoice_no` (query) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/payments/{payment_id}`

### GET: Get Payment Admin

**Description:** Admin: get any payment by id.

Args:
    payment_id: Payment ObjectId.

Returns:
    PaymentsOut

Raises:
    404 if not found.

**Tags:** Payments


**Parameters:**

- `payment_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/payments/{payment_id}/status`

### PUT: Update Payment Status Admin

**Description:** Admin: update a payment's status (e.g., pending → success/failed).

Only `payment_status_id` is expected in the payload.

Args:
    payment_id: Payment ObjectId.
    payload: PaymentsUpdate with `payment_status_id`.

Returns:
    PaymentsOut

Raises:
    400 if `payment_status_id` missing.
    404 if not found.

**Tags:** Payments


**Parameters:**

- `payment_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/card-details/my/by-payment/{payment_id}`

### GET: Get My Card Details By Payment

**Description:** Return masked card details for a payment **owned by the current user**.

**Tags:** Payments


**Parameters:**

- `payment_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/card-details/by-payment/{payment_id}`

### GET: Get Card Details By Payment Admin

**Description:** Admin can fetch masked card details for any `payment_id`.
(Masked even for admins to avoid PAN exposure via API.)

**Tags:** Payments


**Parameters:**

- `payment_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/upi-details/my/by-payment/{payment_id}`

### GET: Get My Upi By Payment

**Description:** Return the caller's own UPI details for the given payment.
Ownership is enforced against the payment's `user_id`.

**Tags:** Payments


**Parameters:**

- `payment_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/upi-details/by-payment/{payment_id}`

### GET: Get Upi By Payment Admin

**Description:** Admin: fetch UPI details associated with a specific payment.

**Tags:** Payments


**Parameters:**

- `payment_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/upi-details/`

### GET: List Upi Details Admin

**Description:** Admin listing with both direct and join-based filters:
- Direct: `payment_id`, `upi_id`
- Join via `payments`: `user_id`, `order_id`

**Tags:** Payments


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `payment_id` (query) — Filter by payment_id

- `upi_id` (query) — Exact UPI ID match

- `user_id` (query) — Filter by user_id (via payments join)

- `order_id` (query) — Filter by order_id (via payments join)


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/coupons/`

### POST: Create Item

**Description:** Create a new coupon.

Args:
    payload: Coupon creation schema.

Returns:
    CouponsOut: Newly created coupon.

Raises:
    HTTPException:
        - 409 if duplicate coupon.
        - 500 on server error.

**Tags:** Coupons


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Items

**Description:** List coupons with optional filters.

Args:
    skip: Pagination offset.
    limit: Page size.
    code: Exact code filter.
    type: Coupon type filter.
    coupons_status_id: Status ObjectId filter.

Returns:
    List[CouponsOut]

**Tags:** Coupons


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `code` (query) — Filter by exact code

- `type` (query) — Filter by type

- `coupons_status_id` (query) — Filter by status id


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/coupons/{item_id}`

### GET: Get Item

**Description:** Get a coupon by its ID.

Args:
    item_id: Coupon ObjectId.

Returns:
    CouponsOut

Raises:
    HTTPException:
        - 404 if not found.
        - 500 on server error.

**Tags:** Coupons


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update Item

**Description:** Update a coupon.

Args:
    item_id: Coupon ObjectId.
    payload: Partial update fields.

Returns:
    CouponsOut

Raises:
    HTTPException:
        - 400 if no fields provided.
        - 404 if not found.
        - 409 if duplicate coupon.
        - 500 on server error.

**Tags:** Coupons


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** Delete a coupon.

Args:
    item_id: Coupon ObjectId.

Returns:
    JSONResponse: {"deleted": True} on success.

Raises:
    HTTPException:
        - 404 if not found.
        - 500 on server error.

**Tags:** Coupons


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/coupons/validate`

### POST: Validate Coupon

**Description:** Validate a coupon against a provided amount.
Returns 200 with CouponCheckOut when valid, else 400 JSON with a structured reason.

Args:
    payload: CouponCheckIn (code, amount).

Returns:
    CouponCheckOut on 200 OK, or JSONResponse on 400.

Raises:
    HTTPException: 500 on server error.

**Tags:** Coupons


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `400` — Invalid coupon

- `422` — Validation Error


---


## `/api/v1/backup-logs/schedule`

### POST: Schedule Backup

**Description:** 

**Tags:** Backup


**Parameters:**

- `scope` (query) — full | users | products | orders | content | payments | returns | exchanges

- `frequency` (query) — 

- `scheduled_at` (query) — 


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---


## `/api/v1/backup-logs/run`

### POST: Run Backup Now

**Description:** 

**Tags:** Backup


**Parameters:**

- `scope` (query) — Label to store with the log. Backup always dumps the DB.

- `gzip` (query) — Use mongodump --gzip


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---


## `/api/v1/backup-logs/`

### GET: List Backups

**Description:** 

**Tags:** Backup


**Parameters:**

- `skip` (query) — 

- `limit` (query) — 

- `status` (query) — 

- `scope` (query) — 

- `frequency` (query) — 

- `date_from` (query) — 

- `date_to` (query) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/backup-logs/{backup_id}`

### GET: Get Backup

**Description:** 

**Tags:** Backup


**Parameters:**

- `backup_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update Backup

**Description:** 

**Tags:** Backup


**Parameters:**

- `backup_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Backup

**Description:** 

**Tags:** Backup


**Parameters:**

- `backup_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/restore-logs/run/latest-full`

### POST: Restore Latest Full

**Description:** Trigger a restore from the **latest full backup** and persist a log.

**Tags:** Restore


**Parameters:**

- `drop` (query) — Pass --drop to mongorestore

- `gzip` (query) — Pass --gzip to mongorestore


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---


## `/api/v1/restore-logs/run/by-backup/{backup_id}`

### POST: Restore By Backup Id

**Description:** Trigger a restore for a specific `backup_id` and persist a log.

**Tags:** Restore


**Parameters:**

- `backup_id` (path) — 

- `drop` (query) — Pass --drop to mongorestore

- `gzip` (query) — Pass --gzip to mongorestore


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---


## `/api/v1/restore-logs/`

### POST: Create Item

**Description:** Create a restore log document (manual record).

**Tags:** Restore


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Items

**Description:** List restore logs with optional filters.

**Tags:** Restore


**Parameters:**

- `skip` (query) — Number of records to skip

- `limit` (query) — Page size (max 200)

- `status` (query) — Filter by exact status

- `backup_id` (query) — Filter by exact backup_id


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/restore-logs/{item_id}`

### GET: Get Item

**Description:** Fetch a single restore log by its id.

**Tags:** Restore


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### PUT: Update Item

**Description:** Update fields of an existing restore log.

**Tags:** Restore


**Parameters:**

- `item_id` (path) — 


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Item

**Description:** Delete a restore log and return {'deleted': True} on success.

**Tags:** Restore


**Parameters:**

- `item_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/contact-us/`

### POST: Create Contact

**Description:** Create a new contact-us entry.

Args:
    payload (ContactUsCreate): User-submitted name, email, subject, message.
    session (AsyncSession): Database session.

Returns:
    ContactUsRead: The created contact record.

**Tags:** Contact Us


**Request Body Example:**


**Responses:**

- `201` — Successful Response

- `422` — Validation Error


---

### GET: List Contacts

**Description:** List all contact-us records (paginated).

Permissions:
    contact_us → Read

Args:
    limit (int): Maximum records to return.
    offset (int): Skip N records.
    session (AsyncSession): Database session.

Returns:
    List[ContactUsRead]: Paginated list of contact submissions.

**Tags:** Contact Us


**Parameters:**

- `limit` (query) — 

- `offset` (query) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/contact-us/{contact_id}`

### GET: Get Contact

**Description:** Retrieve a single contact record by ID.

Permissions:
    contact_us → Read

Args:
    contact_id (uuid.UUID): Unique identifier of contact record.
    session (AsyncSession): Database session.

Raises:
    HTTPException: If contact not found.

Returns:
    ContactUsRead: The contact record.

**Tags:** Contact Us


**Parameters:**

- `contact_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### DELETE: Delete Contact

**Description:** Delete a contact record permanently.

Permissions:
    contact_us → Delete

Args:
    contact_id (uuid.UUID): ID of the record to delete.
    session (AsyncSession): Database session.

Raises:
    HTTPException: If contact does not exist.

Returns:
    204 No Content on successful delete.

**Tags:** Contact Us


**Parameters:**

- `contact_id` (path) — 


**Responses:**

- `204` — Successful Response

- `422` — Validation Error


---


## `/api/v1/logs/login`

### POST: Create Login Log

**Description:** Create a new login audit log.

Args:
    payload (LoginLogCreate): Information containing user_id, IP, user-agent, etc.
    session (AsyncSession): Database session dependency.

Returns:
    LoginLogRead: The stored login log entry.

**Tags:** Logs


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### GET: List Login Logs

**Description:** List stored login logs, paginated.

Args:
    limit (int): Maximum number of records per page.
    offset (int): Record offset for pagination.

Returns:
    List[LoginLogRead]: List of login log entries.

**Tags:** Logs


**Parameters:**

- `limit` (query) — 

- `offset` (query) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/logs/login/{log_id}`

### DELETE: Delete Login Log

**Description:** Delete a specific login log by UUID.

Raises:
    HTTPException 404: When the log does not exist.

**Tags:** Logs


**Parameters:**

- `log_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/logs/logout`

### POST: Create Logout Log

**Description:** Create a logout audit log entry.

Returns:
    LogoutLogRead: Stored logout log.

**Tags:** Logs


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### GET: List Logout Logs

**Description:** List logout logs with pagination.

Returns:
    List[LogoutLogRead]: Log records.

**Tags:** Logs


**Parameters:**

- `limit` (query) — 

- `offset` (query) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/logs/logout/{log_id}`

### DELETE: Delete Logout Log

**Description:** Delete a logout log by UUID.

Raises:
    HTTPException 404: If log does not exist.

**Tags:** Logs


**Parameters:**

- `log_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/logs/register`

### POST: Create Register Log

**Description:** Create a register audit log entry after a successful user registration.

Returns:
    RegisterLogRead: Stored register log.

**Tags:** Logs


**Request Body Example:**


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---

### GET: List Register Logs

**Description:** List registration logs with pagination.

Returns:
    List[RegisterLogRead]: Log records.

**Tags:** Logs


**Parameters:**

- `limit` (query) — 

- `offset` (query) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/logs/register/{log_id}`

### DELETE: Delete Register Log

**Description:** Delete a registration log by UUID.

Raises:
    HTTPException 404: If log does not exist.

**Tags:** Logs


**Parameters:**

- `log_id` (path) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/dashboard/overview`

### GET: Get Overview

**Description:** Get high-level dashboard summary including:
  - total orders
  - completed orders
  - total revenue
  - user count
  - product count

Returns:
    OverviewOut: Aggregated numeric KPIs for UI display.

**Tags:** Dashboard


**Responses:**

- `200` — Successful Response


---


## `/api/v1/dashboard/sales`

### GET: Get Sales

**Description:** Time-series graph: total sales revenue per day.

Args:
    days (int): Number of recent days to include (max 365).

Returns:
    SalesSeriesOut: (days, list of {date, total_sales} points)

**Tags:** Dashboard


**Parameters:**

- `days` (query) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/dashboard/user-growth`

### GET: Get User Growth

**Description:** Time-series graph: number of new users registered per day.

Args:
    days (int): Number of recent days to include.

Returns:
    UserGrowthOut: (days, list of {date, count} points)

**Tags:** Dashboard


**Parameters:**

- `days` (query) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/dashboard/top-products`

### GET: Get Top Products

**Description:** Get highest-selling products for leaderboard charts.

Args:
    limit (int): Maximum number of products to return.

Returns:
    TopProductsOut: Ranked list of products with total sold qty.

**Tags:** Dashboard


**Parameters:**

- `limit` (query) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/dashboard/low-stock`

### GET: Get Low Stock

**Description:** List items that are at or below a given stock threshold.

Args:
    threshold (int): Minimum stock level to trigger alert.

Returns:
    LowStockOut: Items with remaining_qty <= threshold

**Tags:** Dashboard


**Parameters:**

- `threshold` (query) — 


**Responses:**

- `200` — Successful Response

- `422` — Validation Error


---


## `/api/v1/dashboard/system-health`

### GET: Get System Health

**Description:** Show real-time system diagnostics including:
  - DB health
  - API latency
  - Orders log trends
  - Error counts

Returns:
    SystemHealthOut: Aggregated key operational metrics.

**Tags:** Dashboard


**Responses:**

- `200` — Successful Response


---


## `/`

### GET: Root

**Description:** 

**Tags:** Root


**Responses:**

- `200` — Successful Response


---
