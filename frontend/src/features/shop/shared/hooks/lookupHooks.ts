// ============ Lookup Hooks - Shared across features ============
// These hooks query common lookup data (ProductTypes, Categories, Occasions, Brands, Statuses)
// They are re-exported from products/hooks for shared access

export { useProductTypes, useCategories, useOccasions, useBrands, useOrderStatuses, useReturnStatuses, useExchangeStatuses, useReviewStatuses } from '../../products/hooks/useProducts';
