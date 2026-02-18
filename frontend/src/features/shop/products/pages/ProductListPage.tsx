import React, { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Drawer,
  IconButton,
  Typography,
  Breadcrumbs,
  Link,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../app/store';
import { useProducts } from '../hooks/useProducts';
import { useProductTypes, useCategories, useOccasions, useBrands } from '../../shared/hooks/lookupHooks';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '../../wishlist/hooks/useWishlist';
import { ProductGrid } from '../components/ProductGrid';
import { CategorySidebar } from '../components/CategorySidebar';
import { FilterBar } from '../components/FilterBar';
import { LoginRequiredModal } from '../../shared/components/LoginRequiredModal';

export const ProductListPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams, setSearchParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Auth state
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // URL-based filters
  const productTypeId = searchParams.get('product_type') || undefined;
  const categoryId = searchParams.get('category') || undefined;
  const occasionId = searchParams.get('occasion') || undefined;
  const brandIds = React.useMemo(() => searchParams.get('brands')?.split(',').filter(Boolean) || [], [searchParams]);
  const minPrice = searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined;
  const maxPrice = searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined;
  const sortBy = searchParams.get('sort') || 'newest';
  const searchQuery = searchParams.get('q') || undefined;

  // Fetch data
  const { data: productTypes, isLoading: loadingTypes } = useProductTypes();
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { data: occasions, isLoading: loadingOccasions } = useOccasions();
  const { data: brands } = useBrands();
  const { data: products, isLoading: loadingProducts } = useProducts({
    product_type_id: productTypeId,
    category_id: categoryId,
    occasion_id: occasionId,
    q: searchQuery,
    min_price: minPrice,
    max_price: maxPrice,
    limit: 100,
  });
  const { data: wishlistItems } = useWishlist();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  // Wishlisted product IDs
  const wishlistedIds = useMemo(() => {
    if (!wishlistItems) return new Set<string>();
    return new Set(wishlistItems.map(item => item.product_id));
  }, [wishlistItems]);

  // Get wishlist item ID for a product
  const getWishlistItemId = useCallback((productId: string) => {
    return wishlistItems?.find(item => item.product_id === productId)?._id;
  }, [wishlistItems]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let result = [...products];

    // Filter by brands
    if (brandIds.length > 0) {
      result = result.filter(p => brandIds.includes(p.brand_id));
    }

    // Sort
    switch (sortBy) {
      case 'price_low':
        result.sort((a, b) => a.total_price - b.total_price);
        break;
      case 'price_high':
        result.sort((a, b) => b.total_price - a.total_price);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [products, brandIds, sortBy]);

  // Update URL params
  const updateParams = useCallback((updates: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // Handle filter changes
  const handleProductTypeSelect = (id: string | undefined) => {
    updateParams({ product_type: id });
  };

  const handleCategorySelect = (id: string | undefined) => {
    updateParams({ category: id });
  };

  const handleOccasionSelect = (id: string | undefined) => {
    updateParams({ occasion: id });
  };

  const handleBrandChange = (brands: string[]) => {
    updateParams({ brands: brands.length > 0 ? brands.join(',') : undefined });
  };

  const handlePriceChange = (range: [number, number]) => {
    updateParams({
      min_price: range[0] > 0 ? String(range[0]) : undefined,
      max_price: range[1] < 10000 ? String(range[1]) : undefined,
    });
  };

  const handleSortChange = (sort: string) => {
    updateParams({ sort: sort !== 'newest' ? sort : undefined });
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // Handle wishlist toggle
  const handleWishlistToggle = (productId: string) => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }

    const wishlistItemId = getWishlistItemId(productId);
    if (wishlistItemId) {
      removeFromWishlist.mutate(wishlistItemId);
    } else {
      addToWishlist.mutate(productId);
    }
  };

  // Get selected product type name for breadcrumb
  const selectedTypeName = productTypeId
    ? productTypes?.find(pt => pt._id === productTypeId)?.type || ''
    : 'All Products';
  const selectedCategoryName = categoryId
    ? categories?.find(c => c._id === categoryId)?.category
    : undefined;

  // Sidebar content
  const sidebar = (
    <CategorySidebar
      productTypes={productTypes || []}
      categories={categories || []}
      occasions={occasions || []}
      selectedProductType={productTypeId}
      selectedCategory={categoryId}
      selectedOccasion={occasionId}
      onProductTypeSelect={handleProductTypeSelect}
      onCategorySelect={handleCategorySelect}
      onOccasionSelect={handleOccasionSelect}
      loading={loadingTypes || loadingCategories || loadingOccasions}
    />
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/" color="inherit" underline="hover">
            Home
          </Link>
          <Typography color="text.primary">{selectedTypeName}</Typography>
          {selectedCategoryName && (
            <Typography color="text.primary">{selectedCategoryName}</Typography>
          )}
        </Breadcrumbs>

        {/* Category Tabs - Mobile/Desktop horizontal scroll */}
        {categories && categories.length > 0 && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={categoryId || false}
              onChange={(_, value) => handleCategorySelect(value || undefined)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  minWidth: 'auto',
                  px: 2,
                },
              }}
            >
              <Tab label="All" value={false} />
              {categories.map(cat => (
                <Tab key={cat._id} label={cat.category} value={cat._id} />
              ))}
            </Tabs>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Desktop Sidebar */}
          {!isMobile && (
            <Box sx={{ width: 250, flexShrink: 0 }}>
              {sidebar}
            </Box>
          )}

          {/* Mobile Drawer */}
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
          >
            <Box sx={{ width: 280 }}>{sidebar}</Box>
          </Drawer>

          {/* Main Content */}
          <Box sx={{ flexGrow: 1 }}>
            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                onClick={() => setDrawerOpen(true)}
                sx={{ mb: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Filter Bar */}
            <FilterBar
              totalProducts={filteredProducts.length}
              brands={brands || []}
              selectedBrands={brandIds}
              priceRange={[minPrice || 0, maxPrice || 10000]}
              maxPrice={10000}
              sortBy={sortBy}
              viewMode={viewMode}
              onSortChange={handleSortChange}
              onBrandChange={handleBrandChange}
              onPriceChange={handlePriceChange}
              onViewModeChange={setViewMode}
              onClearFilters={handleClearFilters}
            />

            {/* Product Grid */}
            {filteredProducts.length === 0 && !loadingProducts ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  No products found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Try adjusting your filters or search criteria
                </Typography>
              </Box>
            ) : (
              <ProductGrid
                products={filteredProducts}
                loading={loadingProducts}
                wishlistedIds={wishlistedIds}
                onWishlistToggle={handleWishlistToggle}
                showWishlist={true}
              />
            )}
          </Box>
        </Box>
      </Container>

      {/* Login Required Modal */}
      <LoginRequiredModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        message="Please login to add items to your wishlist"
        action="add items to your wishlist"
      />
    </Box>
  );
};
