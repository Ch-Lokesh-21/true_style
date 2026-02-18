import React from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Skeleton,
  Divider,
} from '@mui/material';
import type { ProductType, Category, Occasion } from '../../../shared/types';

interface CategorySidebarProps {
  productTypes?: ProductType[];
  categories?: Category[];
  occasions?: Occasion[];
  selectedProductType?: string;
  selectedCategory?: string;
  selectedOccasion?: string;
  onProductTypeSelect?: (id: string | undefined) => void;
  onCategorySelect?: (id: string | undefined) => void;
  onOccasionSelect?: (id: string | undefined) => void;
  loading?: boolean;
  showImage?: boolean;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  productTypes = [],
  categories = [],
  occasions = [],
  selectedProductType,
  selectedCategory,
  selectedOccasion,
  onProductTypeSelect,
  onCategorySelect,
  onOccasionSelect,
  loading = false,
  showImage = true,
}) => {
  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton variant="rectangular" width="100%" height={150} sx={{ mb: 2 }} />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} variant="text" width="80%" sx={{ mb: 1 }} />
        ))}
      </Box>
    );
  }

  // Get selected product type image
  const selectedPT = productTypes.find(pt => pt._id === selectedProductType);

  return (
    <Box sx={{ py: 2 }}>
      {/* Product Type Image */}
      {showImage && selectedPT && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Box
            component="img"
            src={selectedPT.thumbnail_url}
            alt={selectedPT.type}
            sx={{
              width: '100%',
              aspectRatio: '4/5',
              objectFit: 'cover',
              borderRadius: 1,
            }}
          />
          <Typography variant="body1" sx={{ mt: 1, fontWeight: 500 }}>
            {selectedPT.type}
          </Typography>
        </Box>
      )}

      {/* Product Types (Categories like Men, Women, Ethnic) */}
      {productTypes.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{
              px: 2,
              py: 1,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Shop By
          </Typography>
          <List dense disablePadding>
            <ListItemButton
              selected={!selectedProductType}
              onClick={() => onProductTypeSelect?.(undefined)}
              sx={{
                py: 0.75,
                '&.Mui-selected': {
                  backgroundColor: 'transparent',
                  '& .MuiListItemText-primary': {
                    fontWeight: 600,
                  },
                },
              }}
            >
              <ListItemText
                primary="View All"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItemButton>
            {productTypes.map((pt) => (
              <ListItemButton
                key={pt._id}
                selected={selectedProductType === pt._id}
                onClick={() => onProductTypeSelect?.(pt._id)}
                sx={{
                  py: 0.75,
                  '&.Mui-selected': {
                    backgroundColor: 'transparent',
                    '& .MuiListItemText-primary': {
                      fontWeight: 600,
                    },
                  },
                }}
              >
                <ListItemText
                  primary={pt.type}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      )}

      <Divider sx={{ my: 1 }} />

      {/* Categories */}
      {categories.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{
              px: 2,
              py: 1,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Categories
          </Typography>
          <List dense disablePadding>
            <ListItemButton
              selected={!selectedCategory}
              onClick={() => onCategorySelect?.(undefined)}
              sx={{
                py: 0.75,
                '&.Mui-selected': {
                  backgroundColor: 'transparent',
                  '& .MuiListItemText-primary': {
                    fontWeight: 600,
                  },
                },
              }}
            >
              <ListItemText
                primary="All Categories"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItemButton>
            {categories.map((cat) => (
              <ListItemButton
                key={cat._id}
                selected={selectedCategory === cat._id}
                onClick={() => onCategorySelect?.(cat._id)}
                sx={{
                  py: 0.75,
                  '&.Mui-selected': {
                    backgroundColor: 'transparent',
                    '& .MuiListItemText-primary': {
                      fontWeight: 600,
                    },
                  },
                }}
              >
                <ListItemText
                  primary={cat.category}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      )}

      <Divider sx={{ my: 1 }} />

      {/* Occasions */}
      {occasions.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{
              px: 2,
              py: 1,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Occasions
          </Typography>
          <List dense disablePadding>
            <ListItemButton
              selected={!selectedOccasion}
              onClick={() => onOccasionSelect?.(undefined)}
              sx={{
                py: 0.75,
                '&.Mui-selected': {
                  backgroundColor: 'transparent',
                  '& .MuiListItemText-primary': {
                    fontWeight: 600,
                  },
                },
              }}
            >
              <ListItemText
                primary="All Occasions"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItemButton>
            {occasions.map((occ) => (
              <ListItemButton
                key={occ._id}
                selected={selectedOccasion === occ._id}
                onClick={() => onOccasionSelect?.(occ._id)}
                sx={{
                  py: 0.75,
                  '&.Mui-selected': {
                    backgroundColor: 'transparent',
                    '& .MuiListItemText-primary': {
                      fontWeight: 600,
                    },
                  },
                }}
              >
                <ListItemText
                  primary={occ.occasion}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};
