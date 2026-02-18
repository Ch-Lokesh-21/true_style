import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridSlots,
} from '@mui/x-data-grid';
import { Visibility, Edit, Delete, Add, Image as ImageIcon } from '@mui/icons-material';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '../hooks/useProducts';
import { useBrands } from '../../brands/hooks/useBrands';
import { useCategories } from '../../categories/hooks/useCategories';
import { useOccasions } from '../../occasions/hooks/useOccasions';
import { useProductTypes } from '../../product-types/hooks/useProductTypes';
import { ProductFormModal } from './ProductFormModal';
import { ProductImageManager } from './ProductImageManager';
import type { Product, ProductCreateForm, ProductUpdateForm } from '../types';
import type { Brand } from '../../brands/types';
import type { Category } from '../../categories/types';
import type { Occasion } from '../../occasions/types';
import type { ProductType } from '../../product-types/types';

interface CustomToolbarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  brandFilter: string;
  setBrandFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  occasionFilter: string;
  setOccasionFilter: (value: string) => void;
  stockFilter: string;
  setStockFilter: (value: string) => void;
  brands?: Brand[];
  categories?: Category[];
  occasions?: Occasion[];
}

// Custom Toolbar with Search and Filters
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const CustomToolbar: React.FC<CustomToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  brandFilter,
  setBrandFilter,
  categoryFilter,
  setCategoryFilter,
  occasionFilter,
  setOccasionFilter,
  stockFilter,
  setStockFilter,
  brands,
  categories,
  occasions,
}) => {
  return (
    <Box sx={{ p: 2, width: '100%' }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            fullWidth
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Brand</InputLabel>
            <Select value={brandFilter} label="Brand" onChange={(e) => setBrandFilter(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {brands?.map((brand) => (
                <MenuItem key={brand._id} value={brand._id}>
                  {brand.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {categories?.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Occasion</InputLabel>
            <Select
              value={occasionFilter}
              label="Occasion"
              onChange={(e) => setOccasionFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {occasions?.map((occasion) => (
                <MenuItem key={occasion._id} value={occasion._id}>
                  {occasion.occasion}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Stock Status</InputLabel>
            <Select
              value={stockFilter}
              label="Stock Status"
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="in">In Stock</MenuItem>
              <MenuItem value="out">Out of Stock</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchQuery('');
              setBrandFilter('');
              setCategoryFilter('');
              setOccasionFilter('');
              setStockFilter('');
            }}
          >
            Clear Filters
          </Button>
          <Box sx={{ flexGrow: 1 }} />
        </Box>
      </Box>
  );
};

interface ViewModalProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  brands?: Brand[];
  categories?: Category[];
  occasions?: Occasion[];
  productTypes?: ProductType[];
}

// View Modal Component
const ViewModal: React.FC<ViewModalProps> = ({
  open,
  product,
  onClose,
  brands,
  categories,
  occasions,
  productTypes,
}) => {
  if (!product) return null;

  const brand = brands?.find((b) => b._id === product.brand_id);
  const category = categories?.find((c) => c._id === product.category_id);
  const occasion = occasions?.find((o) => o._id === product.occasion_id);
  const productType = productTypes?.find((pt) => pt._id === product.product_type_id);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Product Details</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', gap: 3 }}>
          <Box sx={{ flex: '0 0 300px' }}>
            <Box
              component="img"
              src={product.thumbnail_url}
              alt={product.name}
              sx={{
                width: '100%',
                height: 300,
                objectFit: 'cover',
                borderRadius: 1,
              }}
            />
          </Box>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" gutterBottom>
              {product.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {product.description}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">
                <strong>Brand:</strong> {brand?.name || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>Category:</strong> {category?.category || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>Occasion:</strong> {occasion?.occasion || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>Product Type:</strong> {productType?.type || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>Color:</strong> {product.color}
              </Typography>
              <Typography variant="body2">
                <strong>Price:</strong> ₹{product.total_price}
              </Typography>
              <Typography variant="body2">
                <strong>Quantity:</strong> {product.quantity}
              </Typography>
              <Typography variant="body2">
                <strong>Stock Status:</strong>{' '}
                <Chip
                  label={product.out_of_stock ? 'Out of Stock' : 'In Stock'}
                  color={product.out_of_stock ? 'error' : 'success'}
                  size="small"
                />
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

interface DeleteModalProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

// Delete Modal Component
const DeleteModal: React.FC<DeleteModalProps> = ({
  open,
  product,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete "{product?.name}"? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" disabled={isDeleting}>
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const ProductList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [occasionFilter, setOccasionFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: 'view' | 'edit' | 'create' | 'delete' | 'images';
    product: Product | null;
  }>({
    open: false,
    mode: 'view',
    product: null,
  });

  const {
    data: products,
    isLoading,
    refetch,
  } = useProducts({
    q: searchQuery,
    brand_id: brandFilter,
    category_id: categoryFilter,
    occasion_id: occasionFilter,
  });
  const { data: brands } = useBrands({});
  const { data: categories } = useCategories({});
  const { data: occasions } = useOccasions({});
  const { data: productTypes } = useProductTypes();

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  useEffect(() => {
    refetch();
  }, [searchQuery, brandFilter, categoryFilter, occasionFilter, stockFilter, refetch]);

  const closeModal = () => {
    setModalState({ open: false, mode: 'view', product: null });
  };

  const handleView = (product: Product) => {
    setModalState({ open: true, mode: 'view', product });
  };

  const handleEdit = (product: Product) => {
    setModalState({ open: true, mode: 'edit', product });
  };

  const handleCreate = () => {
    setModalState({ open: true, mode: 'create', product: null });
  };

  const handleDelete = (product: Product) => {
    setModalState({ open: true, mode: 'delete', product });
  };

  const handleManageImages = (product: Product) => {
    setModalState({ open: true, mode: 'images', product });
  };

  const handleConfirmDelete = () => {
    if (modalState.product) {
      deleteProduct.mutate(modalState.product._id, {
        onSuccess: closeModal,
      });
    }
  };

  const handleSubmit = (data: ProductCreateForm | ProductUpdateForm) => {
    if (modalState.mode === 'edit' && modalState.product) {
      updateProduct.mutate(
        { id: modalState.product._id, data: data as ProductUpdateForm },
        {
          onSuccess: closeModal,
        }
      );
    } else if (modalState.mode === 'create') {
      createProduct.mutate(data as ProductCreateForm, {
        onSuccess: closeModal,
      });
    }
  };

  const filteredProducts = products?.filter((product) => {
    if (stockFilter === 'in') return !product.out_of_stock;
    if (stockFilter === 'out') return product.out_of_stock;
    return true;
  });

  const columns: GridColDef[] = [
    {
      field: 'thumbnail_url',
      headerName: 'Image',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box
          component="img"
          src={params.value}
          alt={params.row.name}
          sx={{
            width: 50,
            height: 50,
            objectFit: 'cover',
            borderRadius: 1,
          }}
        />
      ),
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'brand_id',
      headerName: 'Brand',
      width: 150,
      valueGetter: (_value, row) => {
        const brand = brands?.find((b) => b._id === row.brand_id);
        return brand?.name || 'N/A';
      },
    },
    {
      field: 'category_id',
      headerName: 'Category',
      width: 150,
      valueGetter: (_value, row) => {
        const category = categories?.find((c) => c._id === row.category_id);
        return category?.category || 'N/A';
      },
    },
    {
      field: 'occasion_id',
      headerName: 'Occasion',
      width: 150,
      valueGetter: (_value, row) => {
        const occasion = occasions?.find((o) => o._id === row.occasion_id);
        return occasion?.occasion || 'N/A';
      },
    },
    {
      field: 'product_type_id',
      headerName: 'Product Type',
      width: 150,
      valueGetter: (_value, row) => {
        const pt = productTypes?.find((p) => p._id === row.product_type_id);
        return pt?.type || 'N/A';
      },
    },
    {
      field: 'total_price',
      headerName: 'Price',
      width: 120,
      valueFormatter: (value) => `₹${value}`,
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      width: 100,
      type: 'number',
    },
    {
      field: 'color',
      headerName: 'Color',
      width: 120,
    },
    {
      field: 'out_of_stock',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Out of Stock' : 'In Stock'}
          color={params.value ? 'error' : 'success'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => handleView(params.row)} title="View">
            <Visibility />
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEdit(params.row)}
            title="Edit"
          >
            <Edit />
          </IconButton>
          <IconButton
            size="small"
            color="secondary"
            onClick={() => handleManageImages(params.row)}
            title="Manage Images"
          >
            <ImageIcon />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.row)}
            title="Delete"
          >
            <Delete />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 3, 
          border: '1px solid',
          borderColor: 'grey.200',
          borderRadius: 2,
          bgcolor: 'background.paper'
        }}
      >
        <Box display="flex" justifyContent="center" alignItems="center" mb={3}>
          <Box flex={1} display="flex" justifyContent="center">
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'primary.main' }}>
              Products Management
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={handleCreate}
            sx={{ 
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
              borderRadius: 2,
              px: 3
            }}
          >
            Add Product
          </Button>
        </Box>

        <Paper 
          elevation={1} 
          sx={{ 
            height: 600, 
            width: '100%',
            border: '1px solid',
            borderColor: 'grey.300',
            borderRadius: 2
          }}
        >
        <DataGrid
          rows={filteredProducts || []}
          columns={columns}
          getRowId={(row) => row._id}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
          slots={{
            toolbar: CustomToolbar as unknown as GridSlots['toolbar'],
          }}
          slotProps={{
            toolbar: {
              searchQuery,
              setSearchQuery,
              brandFilter,
              setBrandFilter,
              categoryFilter,
              setCategoryFilter,
              occasionFilter,
              setOccasionFilter,
              stockFilter,
              setStockFilter,
              brands,
              categories,
              occasions,
            } as never,
          }}
        />
      </Paper>
      </Paper>
      {/* View Modal */}
      <ViewModal
        open={modalState.open && modalState.mode === 'view'}
        product={modalState.product}
        onClose={closeModal}
        brands={brands}
        categories={categories}
        occasions={occasions}
        productTypes={productTypes}
      />

      {/* Edit/Create Modal */}
      <ProductFormModal
        open={modalState.open && (modalState.mode === 'edit' || modalState.mode === 'create')}
        onClose={closeModal}
        onSubmit={handleSubmit}
        product={modalState.product}
        isLoading={createProduct.isPending || updateProduct.isPending}
      />

      {/* Delete Modal */}
      <DeleteModal
        open={modalState.open && modalState.mode === 'delete'}
        product={modalState.product}
        onClose={closeModal}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteProduct.isPending}
      />

      {/* Image Management Modal */}
      {modalState.product && (
        <ProductImageManager
          open={modalState.open && modalState.mode === 'images'}
          productId={modalState.product._id}
          productName={modalState.product.name}
          onClose={closeModal}
        />
      )}
    </Box>
  );
};
