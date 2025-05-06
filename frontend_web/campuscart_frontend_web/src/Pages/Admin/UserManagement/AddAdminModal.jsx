import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Alert
} from '@mui/material';
import axios from 'axios';
import ToastManager from '../../../components/ToastManager';
import api from '../../../config/axiosConfig';

const AddAdminModal = ({ open, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    contactNo: '',
    email: ''
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [toasts, setToasts] = useState([]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.contactNo.trim()) {
      newErrors.contactNo = 'Contact number is required';
    } else if (!/^\d+$/.test(formData.contactNo)) {
      newErrors.contactNo = 'Contact number must contain only numbers';
    } else if (formData.contactNo.length !== 11) {
      newErrors.contactNo = 'Contact number must be exactly 11 digits';
    } else if (!formData.contactNo.startsWith('09')) {
      newErrors.contactNo = 'Contact number must start with 09';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      console.log('Sending admin data:', formData);

      const response = await api.post('/admin/addAdmin', {
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        contactNo: formData.contactNo,
        email: formData.email,
        role: 'Admin'
      });
      
      console.log('Admin creation response:', response);
      
      // Check for both 200 and 201 status codes
      if (response.status === 200 || response.status === 201) {
        onAdd(response.data);
        // Reset form data
        setFormData({
          username: '',
          firstName: '',
          lastName: '',
          password: '',
          contactNo: '',
          email: ''
        });
        setErrors({});
        setSubmitError('');
        onClose();
      } else {
        setSubmitError('Unexpected response from server');
      }
    } catch (error) {
      console.error('Error adding admin:', error.response || error);
      setSubmitError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to add admin. Please try again.'
      );
    }
  };

  const handleChange = (field) => (event) => {
    let value = event.target.value;
    
    // Special handling for contact number
    if (field === 'contactNo') {
      // Only allow numbers
      value = value.replace(/[^\d]/g, '');
      // Limit to 11 digits
      value = value.slice(0, 11);
      
      // Validate starting with 09
      if (value.length >= 2 && !value.startsWith('09')) {
        setErrors(prev => ({
          ...prev,
          contactNo: 'Contact number must start with 09'
        }));
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));  
    }
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Admin</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                value={formData.username}
                onChange={handleChange('username')}
                error={!!errors.username}
                helperText={errors.username}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={handleChange('firstName')}
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Password"
                value={formData.password}
                onChange={handleChange('password')}
                error={!!errors.password}
                helperText={errors.password}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contact Number"
                value={formData.contactNo}
                onChange={handleChange('contactNo')}
                error={!!errors.contactNo}
                helperText={errors.contactNo}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                onChange={handleChange('email')}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
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
          Add Admin
        </Button>
      </DialogActions>
      <ToastManager toasts={toasts} handleClose={(id) => {
        setToasts(current => 
          current.map(toast => 
            toast.id === id ? { ...toast, open: false } : toast
          )
        );
      }} />
    </Dialog>
  );
};

export default AddAdminModal;