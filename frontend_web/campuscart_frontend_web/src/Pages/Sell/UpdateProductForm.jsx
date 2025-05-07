import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Box, MenuItem, Select, FormControl, InputLabel, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom'; 
import '../../App.css';
import api from '../../config/axiosConfig';
import { toast } from "react-hot-toast";
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';
import { useLoading } from '../../contexts/LoadingContext';


const UpdateProductForm = ({ product, onUpdateSuccess, setProduct }) => {
  const [productName, setProductName] = useState(product.name || '');
  const [description, setDescription] = useState(product.pdtDescription || '');
  const [price, setPrice] = useState(product.buyPrice || '');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [category, setCategory] = useState(product.category || '');
  const [status, setStatus] = useState(product.status || '');
  const [conditionType, setConditionType] = useState(product.conditionType || '');
  const [originalValues, setOriginalValues] = useState({});
  const navigate = useNavigate();
  const { setLoading } = useLoading();

  useEffect(() => {
    console.log('product passed to form:', product);
    setProductName(product.name || '');
    setDescription(product.pdtDescription || '');
    setPrice(product.buyPrice || '');
    setCategory(product.category || '');
    setStatus(product.status || '');
    setConditionType(product.conditionType || '');
    // Store original values for comparison
    setOriginalValues({
      name: product.name,
      pdtDescription: product.pdtDescription,
      buyPrice: product.buyPrice,
      category: product.category,
      conditionType: product.conditionType,
      imagePath: product.imagePath
    });
  }, [product]);

  const handleImageChange = (e) => {
    setLoading(true);
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageError(false);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImageError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    // Validate negative numbers
    if (Number(price) <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    // Check if any values have changed when status is "Approved"
    const hasChanges = 
      product.status === "Approved" && (
        productName !== originalValues.name ||
        description !== originalValues.pdtDescription ||
        Number(price) !== originalValues.buyPrice ||
        category !== originalValues.category ||
        conditionType !== originalValues.conditionType ||
        imageFile !== null // If there's a new image
      );

      const rejected_hasChanges = 
      product.status === "Rejected" && (
        productName !== originalValues.name ||
        description !== originalValues.pdtDescription ||
        Number(price) !== originalValues.buyPrice ||
        category !== originalValues.category ||
        conditionType !== originalValues.conditionType ||
        imageFile !== null // If there's a new image
      );
      

    // Determine the new status
    let newStatus = status;
    if (product.status === "Pending" || product.status === "Rejected") {
      newStatus = "Pending"; // Keep as Pending
    } else if (product.status === "Approved") {
      if (status === "Sold") {
        newStatus = "Sold"; // Allow change to Sold
      } else if (hasChanges) {
        newStatus = "Pending"; // Change to Pending if there are changes
      }
    }

    try {
      const formData = new FormData();
      
      const productData = {
        name: productName,
        pdtDescription: description,
        buyPrice: price,
        category,
        status: newStatus,
        conditionType: conditionType,
      };

      formData.append('product', new Blob([JSON.stringify(productData)], {
        type: 'application/json'
      }));

      if (imageFile) {
        formData.append('imagePath', imageFile);
      }

      const response = await api.put(`/product/putProductDetails/${product.code}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        if (hasChanges && product.status === "Approved") {
          toast.success('Product updated successfully and status changed to Pending');
        } else if (rejected_hasChanges && product.status === "Rejected") {
          toast.success('Product updated resubmitted successfully and status changed to Pending');
        } else {
          toast.success('Product updated successfully');
        }

        if (typeof onUpdateSuccess === 'function') {
          onUpdateSuccess();
        }
        const updatedProduct = await api.get(`/product/getProductByCode/${product.code}`);
        setProduct(updatedProduct.data);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Close Button */}
      <IconButton
        onClick={() => onUpdateSuccess()}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: '#89343b',
          '&:hover': {
            bgcolor: 'rgba(137, 52, 59, 0.08)',
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold', 
            color: '#89343b',
            mb: 1,
            background: 'linear-gradient(45deg, #89343b 30%, #ffd700 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Update Product
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update your product details
        </Typography>
      </Box>

      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{
          '& .MuiTextField-root, & .MuiFormControl-root': {
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: '#89343b',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#89343b',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#89343b',
            },
          },
        }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Product Name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: productName && (
                <IconButton
                  size="small"
                  onClick={() => setProductName('')}
                  sx={{ color: '#89343b' }}
                >
                  <ClearIcon />
                </IconButton>
              ),
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            type="number"
            label="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: "1" }}
            InputProps={{
              endAdornment: price && (
                <IconButton
                  size="small"
                  onClick={() => setPrice('')}
                  sx={{ color: '#89343b' }}
                >
                  <ClearIcon />
                </IconButton>
              ),
            }}
          />
        </Box>

        <TextField
          margin="normal"
          required
          fullWidth
          label="Description"
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: description && (
              <IconButton
                size="small"
                onClick={() => setDescription('')}
                sx={{ color: '#89343b', position: 'absolute', right: 8, top: 8 }}
              >
                <ClearIcon />
              </IconButton>
            ),
          }}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel shrink>Category</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              displayEmpty
              sx={{ 
                color: category ? 'inherit' : '#A9A9A9',
                '& .MuiSelect-icon': {
                  color: '#89343b',
                },
              }}
            >
              <MenuItem value="" disabled>Select a category</MenuItem>
              <MenuItem value="Food">Food</MenuItem>
              <MenuItem value="Clothes">Clothes</MenuItem>
              <MenuItem value="Accessories">Accessories</MenuItem>
              <MenuItem value="Stationery or Arts and Crafts">Stationery / Arts and Crafts</MenuItem>
              <MenuItem value="Merchandise">Merchandise</MenuItem>
              <MenuItem value="Supplies">Supplies</MenuItem>
              <MenuItem value="Electronics">Electronics</MenuItem>
              <MenuItem value="Beauty">Beauty</MenuItem>
              <MenuItem value="Books">Books</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel shrink>Condition</InputLabel>
            <Select
              value={conditionType}
              onChange={(e) => setConditionType(e.target.value)}
              required
              displayEmpty
              sx={{ 
                color: conditionType ? 'inherit' : '#A9A9A9',
                '& .MuiSelect-icon': {
                  color: '#89343b',
                },
              }}
            >
              <MenuItem value="" disabled>Select condition</MenuItem>
              <MenuItem value="Brand New">Brand New</MenuItem>
              <MenuItem value="Pre-Loved">Pre-Loved</MenuItem>
              <MenuItem value="None">None</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          {product.status === 'Rejected' ? (
            <TextField
              label="Status"
              value="Pending"
              InputProps={{ readOnly: true }}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{ bgcolor: '#f5f5f5' }}
            />
          ) : (
            <FormControl fullWidth margin="normal">
              <InputLabel shrink>Status</InputLabel>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
                displayEmpty
                sx={{ 
                  color: status ? 'inherit' : '#A9A9A9',
                  '& .MuiSelect-icon': {
                    color: '#89343b',
                  },
                }}
              >
                <MenuItem value="" disabled>Select status</MenuItem>
                {product.status === "Approved" ? [
                  <MenuItem key="approved" value="Approved" disabled>Approved</MenuItem>,
                  <MenuItem key="sold" value="Sold">Sold</MenuItem>
                ] : (
                  <MenuItem value="Pending" disabled>Pending</MenuItem>
                )}
              </Select>
            </FormControl>
          )}
        </Box>

        <FormControl fullWidth margin="normal" error={imageError}>
          <InputLabel shrink htmlFor="image-upload">Product Image</InputLabel>
          <Box
            sx={{
              mt: 1,
              p: 3,
              border: '2px dashed',
              borderColor: imageError ? 'error.main' : '#89343b',
              borderRadius: 2,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: '#ffd700',
                bgcolor: 'rgba(137, 52, 59, 0.05)',
              },
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            />
            {imagePreview && imageFile ? (
              <Box sx={{ width: '100%', textAlign: 'center', position: 'relative' }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageFile(null);
                    setImagePreview(null);
                    setImageError(true);
                  }}
                  sx={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    color: '#89343b',
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <Typography variant="body2" sx={{ mb: 1, color: '#89343b' }}>
                  Selected: {imageFile.name}
                </Typography>
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Preview"
                  sx={{
                    maxWidth: '200px',
                    maxHeight: '200px',
                    objectFit: 'contain',
                    display: 'block',
                    margin: '0 auto',
                    borderRadius: 1,
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ mb: 1, color: '#89343b' }}>
                  Click to upload image
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (Max size: 5MB)
                </Typography>
              </Box>
            )}
          </Box>
          {imageError && (
            <Typography color="error" variant="caption" sx={{ mt: 1 }}>
              Please select an image
            </Typography>
          )}
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ 
            mt: 3, 
            mb: 2,
            py: 1.5,
            bgcolor: '#89343b',
            '&:hover': { 
              bgcolor: '#6d2a2f',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Update Product
        </Button>
      </Box>
    </Box>
  );
};

export default UpdateProductForm;
