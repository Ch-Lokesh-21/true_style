import React, { useState } from 'react';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Slider,
  Typography,
  Chip,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  FilterList,
  Sort,
  Close,
  GridView,
  ViewList,
} from '@mui/icons-material';
import type { Brand } from '../../../shared/types';

interface FilterBarProps {
  totalProducts: number;
  brands?: Brand[];
  selectedBrands?: string[];
  priceRange?: [number, number];
  maxPrice?: number;
  sortBy?: string;
  viewMode?: 'grid' | 'list';
  onSortChange?: (sort: string) => void;
  onBrandChange?: (brands: string[]) => void;
  onPriceChange?: (range: [number, number]) => void;
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  onClearFilters?: () => void;
}

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'name', label: 'Name A-Z' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  totalProducts,
  brands = [],
  selectedBrands = [],
  priceRange = [0, 10000],
  maxPrice = 10000,
  sortBy = 'newest',
  viewMode = 'grid',
  onSortChange,
  onBrandChange,
  onPriceChange,
  onViewModeChange,
  onClearFilters,
}) => {
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(priceRange);

  const handleSortClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortSelect = (value: string) => {
    onSortChange?.(value);
    handleSortClose();
  };

  const handleBrandToggle = (brandId: string) => {
    const newSelected = selectedBrands.includes(brandId)
      ? selectedBrands.filter((id) => id !== brandId)
      : [...selectedBrands, brandId];
    onBrandChange?.(newSelected);
  };

  const handlePriceChangeCommitted = () => {
    onPriceChange?.(localPriceRange);
  };

  const hasActiveFilters = selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < maxPrice;

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          mb: 2,
        }}
      >
        {/* Left side - Product count */}
        <Typography variant="body2" color="text.secondary">
          {totalProducts} Products
        </Typography>

        {/* Right side - Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* View Mode Toggle */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => onViewModeChange?.('grid')}
              sx={{
                color: viewMode === 'grid' ? 'primary.main' : 'text.secondary',
              }}
            >
              <GridView fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onViewModeChange?.('list')}
              sx={{
                color: viewMode === 'list' ? 'primary.main' : 'text.secondary',
              }}
            >
              <ViewList fontSize="small" />
            </IconButton>
          </Box>

          {/* Slider for grid size - Desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', width: 150 }}>
            <Slider
              size="small"
              defaultValue={3}
              min={2}
              max={5}
              marks
              sx={{ mx: 2 }}
            />
          </Box>

          {/* Filter Button */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<FilterList />}
            onClick={() => setFilterDrawerOpen(true)}
            sx={{
              borderColor: hasActiveFilters ? 'primary.main' : 'divider',
              color: hasActiveFilters ? 'primary.main' : 'text.primary',
              textTransform: 'none',
            }}
          >
            Filter {hasActiveFilters && `(${selectedBrands.length + (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0)})`}
          </Button>

          {/* Sort Button */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<Sort />}
            onClick={handleSortClick}
            sx={{
              borderColor: 'divider',
              color: 'text.primary',
              textTransform: 'none',
            }}
          >
            Sort
          </Button>
          <Menu
            anchorEl={sortAnchorEl}
            open={Boolean(sortAnchorEl)}
            onClose={handleSortClose}
          >
            {sortOptions.map((option) => (
              <MenuItem
                key={option.value}
                selected={sortBy === option.value}
                onClick={() => handleSortSelect(option.value)}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>

      {/* Active Filters Chips */}
      {hasActiveFilters && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {selectedBrands.map((brandId) => {
            const brand = brands.find((b) => b._id === brandId);
            return (
              <Chip
                key={brandId}
                label={brand?.name || brandId}
                onDelete={() => handleBrandToggle(brandId)}
                size="small"
              />
            );
          })}
          {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
            <Chip
              label={`₹${priceRange[0]} - ₹${priceRange[1]}`}
              onDelete={() => onPriceChange?.([0, maxPrice])}
              size="small"
            />
          )}
          <Button
            size="small"
            onClick={onClearFilters}
            sx={{ textTransform: 'none' }}
          >
            Clear All
          </Button>
        </Box>
      )}

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      >
        <Box sx={{ width: 300, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => setFilterDrawerOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Price Range */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Price Range
            </Typography>
            <Slider
              value={localPriceRange}
              onChange={(_e, value) => setLocalPriceRange(value as [number, number])}
              onChangeCommitted={handlePriceChangeCommitted}
              valueLabelDisplay="auto"
              min={0}
              max={maxPrice}
              sx={{ mt: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption">₹{localPriceRange[0]}</Typography>
              <Typography variant="caption">₹{localPriceRange[1]}</Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Brands */}
          {brands.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Brands
              </Typography>
              <FormGroup>
                {brands.map((brand) => (
                  <FormControlLabel
                    key={brand._id}
                    control={
                      <Checkbox
                        checked={selectedBrands.includes(brand._id)}
                        onChange={() => handleBrandToggle(brand._id)}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">{brand.name}</Typography>}
                  />
                ))}
              </FormGroup>
            </Box>
          )}

          <Divider sx={{ mb: 2 }} />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                onClearFilters?.();
                setLocalPriceRange([0, maxPrice]);
              }}
            >
              Clear
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={() => setFilterDrawerOpen(false)}
            >
              Apply
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};
