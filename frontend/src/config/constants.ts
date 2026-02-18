export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api/v1';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    CHANGE_PASSWORD: '/auth/password/change',
    FORGOT_PASSWORD_REQUEST: '/auth/password/reset-request',
    FORGOT_PASSWORD_VERIFY: '/auth/password/reset-verify',
  },
  USERS: {
    ME: '/users/me',
    LIST: '/users',
    UPDATE: '/users',
  },
  UTILITY: {
    ORDER_STATUS: '/order-status',
    RETURN_STATUS: '/return-status',
    EXCHANGE_STATUS: '/exchange-status',
    REVIEW_STATUS: '/review-status',
  },
  ADMIN: {
    BRANDS: '/brands',
    CATEGORIES: '/categories',
    OCCASIONS: '/occasions',
    PRODUCT_TYPES: '/product-types',
    PRODUCT_IMAGES: '/product-images',
    PRODUCTS: '/products',
    PRODUCTS_ADMIN: '/products/admin',
    ORDERS: {
      LIST: '/orders/admin',
      STATUS: '/order-status',
    },
    RETURNS: {
      LIST: '/returns/admin',
      STATUS: '/return-status',
    },
    EXCHANGES: {
      LIST: '/exchanges/admin',
      STATUS: '/exchange-status',
    },
    REVIEWS: {
      LIST: '/user-reviews',
      STATUS: '/review-status',
      BY_STATUS: '/user-reviews/admin/by-status',
      SET_STATUS: '/user-reviews/admin',
      DELETE: '/user-reviews/admin',
    },
    RATINGS: {
      LIST: '/user-ratings',
      DELETE: '/user-ratings/admin',
    },
    CONTACT_US: '/contact-us',
    DASHBOARD: {
      OVERVIEW: '/dashboard/overview',
      ADMIN_OVERVIEW: '/dashboard/admin-overview',
      SALES_BY_CATEGORY: '/dashboard/sales-by-category',
      SALES_BY_BRAND: '/dashboard/sales-by-brand',
      PENDING_WORK: '/dashboard/pending-work',
      RECENT_ORDERS: '/dashboard/recent-orders',
      SALES: '/dashboard/sales',
      USER_GROWTH: '/dashboard/user-growth',
      TOP_PRODUCTS: '/dashboard/top-products',
      LOW_STOCK: '/dashboard/low-stock',
      SYSTEM_HEALTH: '/dashboard/system-health',
    },
  },
  BRANDS: '/brands',
  CATEGORIES: '/categories',
  OCCASIONS: '/occasions',
  PRODUCT_TYPES: '/product-types',
  PRODUCT_IMAGES: '/product-images',
  CONTENT: {
    ABOUT: '/about',
    FAQ: '/faq',
    HERO_IMAGES: '/hero-images',
    HERO_IMAGES_MOBILE: '/hero-images-mobile',
    TESTIMONIALS: '/testimonials',
    TERMS: '/terms',
    POLICIES: '/policies',
    HOW_IT_WORKS: '/how-it-works',
    STORE_DETAILS: '/store-details',
    CARDS_1: '/cards-1',
    CARDS_2: '/cards-2',
  },
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  
  SHOP: '/shop',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  CHECKOUT: '/checkout',
  ORDER_SUCCESS: '/order-success',
  
  USER: {
    PROFILE: '/profile',
    ORDERS: '/orders',
    ORDER_DETAIL: '/orders/:id',
    ADDRESSES: '/addresses',
    WISHLIST: '/wishlist',
    CART: '/cart',
    RETURNS: '/returns',
    EXCHANGES: '/exchanges',
    AI_SEARCH: '/ai-search',
  },
  
  ADMIN: {
    HOME: '/admin',
    BRANDS: '/admin/brands',
    CATEGORIES: '/admin/categories',
    OCCASIONS: '/admin/occasions',
    PRODUCT_TYPES: '/admin/product-types',
    PRODUCTS: '/admin/products',
    ORDERS: '/admin/orders',
    RETURNS: '/admin/returns',
    EXCHANGES: '/admin/exchanges',
    REVIEWS: '/admin/reviews',
    RATINGS: '/admin/ratings',
    CONTACT_US: '/admin/contact-us',
    CONTENT: '/admin/content',
    CONTENT_ABOUT: '/admin/content/about',
    CONTENT_FAQ: '/admin/content/faq',
    CONTENT_HERO_IMAGES: '/admin/content/hero-images',
    CONTENT_HERO_IMAGES_MOBILE: '/admin/content/hero-images-mobile',
    CONTENT_TESTIMONIALS: '/admin/content/testimonials',
    CONTENT_TERMS: '/admin/content/terms',
    CONTENT_POLICIES: '/admin/content/policies',
    CONTENT_HOW_IT_WORKS: '/admin/content/how-it-works',
    CONTENT_STORE_DETAILS: '/admin/content/store-details',
    CONTENT_CARDS_1: '/admin/content/cards-1',
    CONTENT_CARDS_2: '/admin/content/cards-2',
  },
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
} as const;

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const PHONE_REGEX = /^\d{4,14}$/;
export const COUNTRY_CODE_REGEX = /^\+\d{1,3}$/;
export const NAME_REGEX = /^[A-Za-z\s]+$/;

export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Invalid email address',
  PASSWORD_MIN: 'Password must be at least 8 characters',
  PASSWORD_PATTERN: 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&)',
  NAME_PATTERN: 'Name should contain only alphabetic characters and spaces',
  PHONE_PATTERN: 'Phone number should be between 4 and 14 digits',
  COUNTRY_CODE_PATTERN: 'Country code should start with + followed by 1-3 digits',
  NAME_LENGTH: 'Name should be between 1 and 50 characters',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;
