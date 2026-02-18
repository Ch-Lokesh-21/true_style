import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { useBrands } from '../../brands/hooks/useBrands';
import { useCategories } from '../../categories/hooks/useCategories';
import { useOccasions } from '../../occasions/hooks/useOccasions';
import { useProductTypes } from '../../product-types/hooks/useProductTypes';
import type { Product, ProductCreateForm, ProductUpdateForm } from '../types';

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProductCreateForm | ProductUpdateForm) => void;
  product?: Product | null;
  isLoading?: boolean;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  product,
  isLoading,
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();
  const { data: occasions } = useOccasions();
  const { data: productTypes } = useProductTypes();

  // Compute the display preview: user-selected preview or product thumbnail
  const displayPreview = previewImage || product?.thumbnail_url || null;

  interface ProductFormData {
    brand_id: string;
    occasion_id: string;
    category_id: string;
    product_type_id: string;
    name: string;
    description: string;
    price: number;
    hsn_code: number;
    gst_percentage: number;
    gst_amount: number;
    total_price: number;
    color: string;
    quantity: number;
    thumbnail?: FileList;
  }

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      brand_id: product?.brand_id || '',
      occasion_id: product?.occasion_id || '',
      category_id: product?.category_id || '',
      product_type_id: product?.product_type_id || '',
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      hsn_code: product?.hsn_code || 0,
      gst_percentage: product?.gst_percentage || 0,
      gst_amount: product?.gst_amount || 0,
      total_price: product?.total_price || 0,
      color: product?.color || '',
      quantity: product?.quantity || 0,
    },
  });

  const price = useWatch({ control, name: 'price', defaultValue: 0 });
  const gst_percentage = useWatch({ control, name: 'gst_percentage', defaultValue: 0 });

  useEffect(() => {
    const priceNum = parseFloat(String(price)) || 0;
    const gstPercentNum = parseFloat(String(gst_percentage)) || 0;
    
    const gstAmount = (priceNum * gstPercentNum) / 100;
    const totalPrice = priceNum + gstAmount;
    setValue('gst_amount', parseFloat(gstAmount.toFixed(2)));
    setValue('total_price', parseFloat(totalPrice.toFixed(2)));
  }, [price, gst_percentage, setValue]);

  useEffect(() => {
    if (product) {
      reset({
        brand_id: product.brand_id,
        occasion_id: product.occasion_id,
        category_id: product.category_id,
        product_type_id: product.product_type_id,
        name: product.name,
        description: product.description,
        price: product.price,
        hsn_code: product.hsn_code,
        gst_percentage: product.gst_percentage,
        gst_amount: product.gst_amount,
        total_price: product.total_price,
        color: product.color,
        quantity: product.quantity,
      });
    } else {
      reset({
        brand_id: '',
        occasion_id: '',
        category_id: '',
        product_type_id: '',
        name: '',
        description: '',
        price: 0,
        hsn_code: 0,
        gst_percentage: 0,
        gst_amount: 0,
        total_price: 0,
        color: '',
        quantity: 0,
      });
    }
  }, [product, reset]);

  const handleClose = () => {
    setPreviewImage(null);
    onClose();
  };

  const handleFormSubmit = (data: ProductFormData) => {
    const formData: ProductCreateForm | ProductUpdateForm = {
      brand_id: data.brand_id,
      occasion_id: data.occasion_id,
      category_id: data.category_id,
      product_type_id: data.product_type_id,
      name: data.name,
      description: data.description,
      price: Number(data.price),
      hsn_code: Math.floor(Number(data.hsn_code)),
      gst_percentage: Math.floor(Number(data.gst_percentage)),
      gst_amount: Number(data.gst_amount),
      total_price: Number(data.total_price),
      color: data.color,
      quantity: Math.floor(Number(data.quantity)),
      thumbnail: data.thumbnail?.[0],
    };
    onSubmit(formData);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const thumbnailRegister = register('thumbnail', {
    required: !product ? 'Thumbnail is required' : false,
  });

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{product ? 'Edit Product' : 'Create Product'}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth error={!!errors.brand_id}>
                <InputLabel>Brand</InputLabel>
                <Controller
                  name="brand_id"
                  control={control}
                  rules={{ required: 'Brand is required' }}
                  render={({ field }) => (
                    <Select {...field} label="Brand" disabled={isLoading}>
                      {brands?.map((brand) => (
                        <MenuItem key={brand._id} value={brand._id}>
                          {brand.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.brand_id && (
                  <FormHelperText>{errors.brand_id.message as string}</FormHelperText>
                )}
              </FormControl>
              <FormControl fullWidth error={!!errors.category_id}>
                <InputLabel>Category</InputLabel>
                <Controller
                  name="category_id"
                  control={control}
                  rules={{ required: 'Category is required' }}
                  render={({ field }) => (
                    <Select {...field} label="Category" disabled={isLoading}>
                      {categories?.map((category) => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.category}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.category_id && (
                  <FormHelperText>{errors.category_id.message as string}</FormHelperText>
                )}
              </FormControl>
              <FormControl fullWidth error={!!errors.occasion_id}>
                <InputLabel>Occasion</InputLabel>
                <Controller
                  name="occasion_id"
                  control={control}
                  rules={{ required: 'Occasion is required' }}
                  render={({ field }) => (
                    <Select {...field} label="Occasion" disabled={isLoading}>
                      {occasions?.map((occasion) => (
                        <MenuItem key={occasion._id} value={occasion._id}>
                          {occasion.occasion}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.occasion_id && (
                  <FormHelperText>{errors.occasion_id.message as string}</FormHelperText>
                )}
              </FormControl>
              <FormControl fullWidth error={!!errors.product_type_id}>
                <InputLabel>Product Type</InputLabel>
                <Controller
                  name="product_type_id"
                  control={control}
                  rules={{ required: 'Product Type is required' }}
                  render={({ field }) => (
                    <Select {...field} label="Product Type" disabled={isLoading}>
                      {productTypes?.map((pt) => (
                        <MenuItem key={pt._id} value={pt._id}>
                          {pt.type}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.product_type_id && (
                  <FormHelperText>{errors.product_type_id.message as string}</FormHelperText>
                )}
              </FormControl>
              <TextField
                fullWidth
                label="Product Name"
                {...register('name', {
                  required: 'Name is required',
                  maxLength: { value: 200, message: 'Max 200 characters' },
                })}
                error={!!errors.name}
                helperText={errors.name?.message as string}
                disabled={isLoading}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                {...register('description', {
                  required: 'Description is required',
                  maxLength: { value: 4000, message: 'Max 4000 characters' },
                })}
                error={!!errors.description}
                helperText={errors.description?.message as string}
                disabled={isLoading}
              />
              <TextField
                fullWidth
                label="Price"
                type="number"
                inputProps={{ step: '0.01' }}
                {...register('price', {
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be non-negative' },
                  valueAsNumber: true,
                })}
                error={!!errors.price}
                helperText={errors.price?.message as string}
                disabled={isLoading}
              />
              <TextField
                fullWidth
                label="GST Percentage"
                type="number"
                inputProps={{ step: '1', min: 0, max: 100 }}
                {...register('gst_percentage', {
                  required: 'GST Percentage is required',
                  min: { value: 0, message: 'Min 0%' },
                  max: { value: 100, message: 'Max 100%' },
                  valueAsNumber: true,
                })}
                error={!!errors.gst_percentage}
                helperText={errors.gst_percentage?.message as string}
                disabled={isLoading}
              />
              <TextField
                fullWidth
                label="GST Amount"
                type="number"
                {...register('gst_amount', { valueAsNumber: true })}
                disabled
                InputProps={{ readOnly: true }}
              />
              <TextField
                fullWidth
                label="Total Price"
                type="number"
                {...register('total_price', { valueAsNumber: true })}
                disabled
                InputProps={{ readOnly: true }}
              />
              <TextField
                fullWidth
                label="HSN Code"
                type="number"
                inputProps={{ step: '1', min: 0 }}
                {...register('hsn_code', {
                  required: 'HSN Code is required',
                  min: { value: 0, message: 'Must be non-negative' },
                  valueAsNumber: true,
                })}
                error={!!errors.hsn_code}
                helperText={errors.hsn_code?.message as string}
                disabled={isLoading}
              />
              <TextField
                fullWidth
                label="Color"
                {...register('color', {
                  required: 'Color is required',
                  maxLength: { value: 50, message: 'Max 50 characters' },
                })}
                error={!!errors.color}
                helperText={errors.color?.message as string}
                disabled={isLoading}
              />
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                inputProps={{ step: '1', min: 0 }}
                {...register('quantity', {
                  required: 'Quantity is required',
                  min: { value: 0, message: 'Must be non-negative' },
                  valueAsNumber: true,
                })}
                error={!!errors.quantity}
                helperText={errors.quantity?.message as string}
                disabled={isLoading}
              />
              <Button variant="outlined" component="label" fullWidth>
                {product ? 'Change Thumbnail' : 'Upload Thumbnail'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  {...thumbnailRegister}
                  onChange={(e) => {
                    thumbnailRegister.onChange(e);
                    handleImageChange(e);
                  }}
                />
              </Button>
              {errors.thumbnail && (
                <FormHelperText error>{errors.thumbnail.message as string}</FormHelperText>
              )}
              {displayPreview && (
                <Box mt={2} textAlign="center">
                  <img
                    src={displayPreview}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: 200 }}
                  />
                </Box>
              )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {product ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
