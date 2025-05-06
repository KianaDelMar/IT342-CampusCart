import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import ToastManager from '../../../components/ToastManager';
import api from '../../../config/axiosConfig';

const UpdateProductModal = ({ open, onClose, product }) => {
  const [editData, setEditData] = useState({
    name: '',
    pdtDescription: '',
    buyPrice: '',
    category: '',
    conditionType: ''
  });
  const [errors, setErrors] = useState({});
  const [toasts, setToasts] = useState([]);
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setEditData({
        name: product.name || '',
        pdtDescription: product.pdtDescription || '',
        buyPrice: product.buyPrice || '',
        category: product.category || '',
        conditionType: product.conditionType || ''
      });
    }
  }, [product]);

  const validateForm = () => {
    const newErrors = {};

    if (!editData.name.trim()) newErrors.name = 'Product name is required';
    if (!editData.pdtDescription.trim()) newErrors.pdtDescription = 'Description is required';
    if (!editData.buyPrice) newErrors.buyPrice = 'Price is required';
    if (Number(editData.buyPrice) <= 0) newErrors.buyPrice = 'Price must be greater than 0';
    if (!editData.category) newErrors.category = 'Category is required';
    if (!editData.conditionType) newErrors.conditionType = 'Condition is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setConfirmEditOpen(true);
  };

  const showToast = (message, severity = 'success') => {
    const newToast = {
      id: Date.now(),
      message,
      severity,
      open: true
    };
    setToasts(current => [newToast, ...current].slice(0, 2));
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            padding: '16px',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle variant="h4"
          sx={{
            fontWeight: 'bold',
            color: '#89343b',
            borderBottom: '1px solid #e0e0e0',
            mb: 1,
            background: 'linear-gradient(45deg, #89343b 30%, #ffd700 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
          Product Details
        </DialogTitle>

        <DialogContent>
          <Box sx={{
            display: 'grid', '& .MuiTextField-root, & .MuiFormControl-root': {
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
          }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                label="Product Name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                error={!!errors.name}
                helperText={errors.name}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                type="number"
                label="Price"
                value={editData.buyPrice}
                onChange={(e) => setEditData({ ...editData, buyPrice: e.target.value })}
                error={!!errors.buyPrice}
                helperText={errors.buyPrice}
              />
            </Box>
            <TextField
              margin="normal"
              required
              label="Description"
              multiline
              rows={3}
              value={editData.pdtDescription}
              onChange={(e) => setEditData({ ...editData, pdtDescription: e.target.value })}
              error={!!errors.pdtDescription}
              helperText={errors.pdtDescription}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <FormControl fullWidth margin="normal" required error={!!errors.category}>
                <InputLabel shrink>Category</InputLabel>
                <Select
                  value={editData.category}
                  label="Category"
                  onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                  sx={{
                    color: editData.category ? 'inherit' : '#A9A9A9',
                    '& .MuiSelect-icon': {
                      color: '#89343b',
                    },
                  }}
                >
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

              <FormControl fullWidth margin="normal" required error={!!errors.conditionType}>
                <InputLabel shrink>Condition</InputLabel>
                <Select
                  value={editData.conditionType}
                  label="Condition"
                  onChange={(e) => setEditData({ ...editData, conditionType: e.target.value })}
                  sx={{
                    color: editData.conditionType ? 'inherit' : '#A9A9A9',
                    '& .MuiSelect-icon': {
                      color: '#89343b',
                    },
                  }}
                >
                  <MenuItem value="Brand New">Brand New</MenuItem>
                  <MenuItem value="Pre-Loved">Pre-Loved</MenuItem>
                  <MenuItem value="None">None</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderColor: '#89343b',
              color: '#89343b',
              '&:hover': {
                borderColor: '#6d2931',
                backgroundColor: 'rgba(137, 52, 59, 0.04)'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              bgcolor: '#89343b',
              '&:hover': { bgcolor: '#6d2931' },
              ml: 2
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <ToastManager toasts={toasts} handleClose={(id) => {
        setToasts(current =>
          current.map(toast =>
            toast.id === id ? { ...toast, open: false } : toast
          )
        );
      }} />

<Dialog
  open={confirmEditOpen}
  onClose={() => setConfirmEditOpen(false)}
>
  <DialogTitle>Confirm Edit</DialogTitle>
  <DialogContent>
    <Typography>
      Are you sure you want to save the changes to the product <strong>{editData.name}</strong>?
    </Typography>
    <Box mt={2}>
      <Typography variant="body2"><strong>Price:</strong> {editData.buyPrice}</Typography>
      <Typography variant="body2"><strong>Description:</strong> {editData.pdtDescription}</Typography>
      <Typography variant="body2"><strong>Category:</strong> {editData.category}</Typography>
      <Typography variant="body2"><strong>Condition:</strong> {editData.conditionType}</Typography>
    </Box>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setConfirmEditOpen(false)} color="inherit">
      Cancel
    </Button>
    <Button
      onClick={async () => {
        // Call the actual API to submit the form after confirmation
        if (validateForm()) {
          try {
            const response = await api.put(
              `/admin/editproducts/${product.code}`,
              {
                ...editData,
                buyPrice: Number(editData.buyPrice)
              }
            );

            if (response.status === 200) {
              showToast('Product updated successfully', 'success');
              onClose();  // Close the modal after successful update
            } else {
              showToast('Product update failed', 'error');
            }
          } catch (error) {
            showToast(error.response?.data?.message || 'Error updating product', 'error');
          }
        }
        setConfirmEditOpen(false);  // Close confirmation modal
      }}
      color="primary"
      variant="contained"
    >
      Confirm
    </Button>
  </DialogActions>
</Dialog>

    </>
  );
};

export default UpdateProductModal;
