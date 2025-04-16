import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../config/axiosConfig';
import { TextField, Button, Typography, Box, MenuItem, Select, FormControl, InputLabel, Modal, Snackbar, Alert, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom'; 
import '../../App.css';
import { toast } from "react-hot-toast";
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';

const AddProductForm = ({ open, handleClose }) => { 
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [category, setCategory] = useState('');
  const [conditionType, setConditionType] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userInfo, setUserInfo] = useState(null); 
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [status, setStatus] = useState('');

  useEffect(() => {
    const username = sessionStorage.getItem('username');
    if (username) {
      setUserUsername(username); 
      api.get(`/user/getUsername/${username}`)
        .then(response => {
          setUserInfo(response.data); 
        })
        .catch(error => {
          console.error('Error fetching user information:', error);
          alert('Could not retrieve user data');
        });
    } else {
      navigate('/login');  
    }
  }, [navigate]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with image:', imageFile); // Debug log

    // Validate negative numbers
    if (Number(price) <= 0) {
        toast.error('Price must be greater than 0');
        return;
    }

    if (Number(quantity) <= 0) {
        toast.error('Quantity must be greater than 0');
        return;
    }

    if (!productName || !description || !quantity || !price || !category || !conditionType || !imageFile || !status) {
        if (!imageFile) {
            setImageError(true);
            console.log('Image file missing'); // Debug log
        }
        toast.error('All fields must be filled in');
        return;
    }

    const formData = new FormData();
    formData.append('name', productName);
    formData.append('pdtDescription', description);
    formData.append('qtyInStock', quantity);
    formData.append('buyPrice', price);
    formData.append('category', category);
    formData.append('status', status);
    formData.append('conditionType', conditionType);
    formData.append('user_username', userUsername); 

    if (imageFile) {
      console.log('Appending image to formData:', imageFile); // Debug log
      formData.append('image', imageFile);
    } else {
      console.log('No image file to append'); // Debug log
      setSnackbar({
        open: true,
        message: 'No image selected',
        severity: 'error'
      });
      return;
    }

    try {
      console.log('Sending formData to backend'); // Debug log
      await api.post('/product/postproduct', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',  
        }
      });

      // Reset all form fields
      setProductName('');
      setDescription('');
      setQuantity('');
      setPrice('');
      setCategory('');
      setConditionType('');
      setImageFile(null);
      setStatus('');

      toast.success('Product added successfully!');
      handleClose(); 
      navigate('/profile');  
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(error.response?.data?.message || 'Failed to add product');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log('Selected file:', file); // Debug log
    if (file) {
      setImageFile(file);
      setImageError(false);
      const previewUrl = URL.createObjectURL(file);
      console.log('Preview URL:', previewUrl); // Debug log
      setImagePreview(previewUrl);
    } else {
      console.log('No file selected'); // Debug log
      setImageError(true);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            p: 4,
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            width: '90%',
            maxWidth: 600,
            maxHeight: '90vh',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#89343b',
              borderRadius: '4px',
              '&:hover': {
                background: '#6d2a2f',
              },
            },
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={handleClose}
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
              Add New Product
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fill in the details to list your product
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
              <TextField
                margin="normal"
                required
                fullWidth
                type="number"
                label="Quantity in Stock"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: "1" }}
              />

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
                  <MenuItem value="Pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              margin="normal"
              fullWidth
              label="Username"
              value={userUsername}
              InputProps={{
                readOnly: true,
              }}
              InputLabelProps={{ shrink: true }}
              sx={{ bgcolor: '#f5f5f5' }}
            />

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
              Add Product
            </Button>
          </Box>
        </Box>
      </Modal>
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{
            backgroundColor: snackbar.severity === 'success' ? '#89343b' : undefined,
            color: snackbar.severity === 'success' ? 'white' : undefined,
            '& .MuiAlert-icon': {
              color: snackbar.severity === 'success' ? 'white' : undefined
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddProductForm;