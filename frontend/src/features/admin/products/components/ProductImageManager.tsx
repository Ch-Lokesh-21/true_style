import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Delete, Add, CloudUpload } from '@mui/icons-material';
import { 
  useProductImages, 
  useCreateProductImage, 
  useDeleteProductImage 
} from '../../product-images';

interface ProductImageManagerProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

export const ProductImageManager: React.FC<ProductImageManagerProps> = ({
  open,
  onClose,
  productId,
  productName,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);

  const { data: images, isLoading } = useProductImages({ product_id: productId });
  const createImage = useCreateProductImage();
  const deleteImage = useDeleteProductImage();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    createImage.mutate(
      { product_id: productId, image: selectedFile },
      {
        onSuccess: () => {
          setSelectedFile(null);
          setPreviewUrl(null);
        },
      }
    );
  };

  const handleDeleteClick = (imageId: string) => {
    setImageToDelete(imageId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (imageToDelete) {
      deleteImage.mutate(imageToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setImageToDelete(null);
        },
      });
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Manage Images - {productName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 2 }}>
            {/* Upload Section */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Upload New Image
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  disabled={createImage.isPending}
                >
                  Choose Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </Button>
                {selectedFile && (
                  <>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {selectedFile.name}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleUpload}
                      disabled={createImage.isPending}
                      startIcon={<Add />}
                    >
                      Upload
                    </Button>
                  </>
                )}
              </Box>
              {previewUrl && (
                <Box mt={2} sx={{ textAlign: 'center' }}>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }}
                  />
                </Box>
              )}
              {createImage.isError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Failed to upload image. Please try again.
                </Alert>
              )}
            </Box>

            {/* Images Grid */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Product Images ({images?.length || 0})
              </Typography>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : images && images.length > 0 ? (
                <ImageList cols={3} gap={16}>
                  {images.map((image) => (
                    <ImageListItem key={image._id}>
                      <img
                        src={image.image_url}
                        alt="Product"
                        loading="lazy"
                        style={{ height: 200, objectFit: 'cover' }}
                      />
                      <ImageListItemBar
                        actionIcon={
                          <IconButton
                            sx={{ color: 'rgba(255, 255, 255, 0.9)' }}
                            onClick={() => handleDeleteClick(image._id)}
                          >
                            <Delete />
                          </IconButton>
                        }
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              ) : (
                <Typography color="text.secondary" align="center" py={3}>
                  No images uploaded yet
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this image? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteImage.isPending}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
