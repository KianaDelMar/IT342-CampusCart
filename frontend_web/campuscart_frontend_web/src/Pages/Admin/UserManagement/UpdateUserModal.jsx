import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  Alert
} from '@mui/material';
import axios from 'axios';
import ToastManager from '../../../components/ToastManager';
import api from '../../../config/axiosConfig';

const UpdateUserModal = ({ open, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNo: ''
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [toasts, setToasts] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        contactNo: user.contactNo || ''
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.contactNo && formData.contactNo.trim()) {
      if (!/^\d+$/.test(formData.contactNo)) {
        newErrors.contactNo = 'Contact number must contain only numbers';
      } else if (formData.contactNo.length !== 11) {
        newErrors.contactNo = 'Contact number must be exactly 11 digits';
      } else if (!formData.contactNo.startsWith('09')) {
        newErrors.contactNo = 'Contact number must start with 09';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleSubmit = async () => {
    if (!user) return;

    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    try {
      const role = user.role === 'Admin' ? 'admin' : 'user';
      const apiUrl = `http://localhost:8080/api/admin/updateUserDetails/${role}/${user.username}`;

      const updateData = {
        username: user.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        contactNo: formData.contactNo
      };

      console.log('Sending request to:', apiUrl);
      console.log('Update data:', updateData);

      const response = await api.put(apiUrl, updateData);

      if (response.status === 200) {
        onSave({
          ...user,
          ...updateData
        });
        onClose();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setSubmitError(error.response?.data?.message || 'Failed to update user. Please try again.');
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

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Update User Information
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Grid container spacing={2}>
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
                label="Email"
                value={formData.email}
                onChange={handleChange('email')}
                error={!!errors.email}
                helperText={errors.email}
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
                label="Role"
                value={user.role}
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  "& .MuiInputBase-input.Mui-readOnly": {
                    backgroundColor: "#f5f5f5"
                  }
                }}
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
          onClick={() => setConfirmOpen(true)} // <-- open confirmation
          variant="contained"
          sx={{
            bgcolor: '#89343b',
            '&:hover': { bgcolor: '#6d2931' },
            ml: 2
          }}
        >
          Update
        </Button>

      </DialogActions>
      <ToastManager toasts={toasts} handleClose={(id) => {
        setToasts(current =>
          current.map(toast =>
            toast.id === id ? { ...toast, open: false } : toast
          )
        );
      }} />

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Update</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to update this user's information?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setConfirmOpen(false);
              handleSubmit();
            }}
            color="primary"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

    </Dialog>
  );
};

export default UpdateUserModal;