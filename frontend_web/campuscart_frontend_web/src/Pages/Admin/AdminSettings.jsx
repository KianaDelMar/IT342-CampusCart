import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Button, TextField, Paper, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import axios from 'axios';
import ToastManager from '../../components/ToastManager';
import toast from 'react-hot-toast';
import api from '../../config/axiosConfig';

const AdminSettings = () => {
  const [username, setUsername] = useState(sessionStorage.getItem('userName') || '');
  const [firstName, setFirstName] = useState(sessionStorage.getItem('firstName') || '');
  const [lastName, setLastName] = useState(sessionStorage.getItem('lastName') || '');
  const [email, setEmail] = useState(sessionStorage.getItem('email') || '');
  const [contactNo, setContactNo] = useState(sessionStorage.getItem('contactNo') || '');
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toasts, setToasts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openConfirmUpdate, setOpenConfirmUpdate] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };
  
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleOpenConfirmUpdate = () => {
    setOpenConfirmUpdate(true);
  };

  const handleCloseConfirmUpdate = () => {
    setOpenConfirmUpdate(false);
  };

  const handleOpenConfirmDelete = () => {
    setOpenConfirmDelete(true);
  };

  const handleCloseConfirmDelete = () => {
    setOpenConfirmDelete(false);
  };
  
  const handleChangePassword = () => {
    handleOpenModal();
  };  

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleUploadProfileImage = async () => {
    if (!profileImage) {
      showToast('No profile image selected.', 'warning');
      return;
    }

    const username = sessionStorage.getItem('username');
    const formData = new FormData();
    formData.append('file', profileImage);

    try {
      const response = await api.post(`/admin/uploadProfilePhoto/${username}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 200) {
        showToast('Profile picture updated successfully!', 'success');
        setPreviewImage(`http://localhost:8080/uploads/${response.data.fileName}`);
      }
    } catch (error) {
      console.error('Error uploading profile photo: ', error);
      showToast('Failed to upload profile photo.', 'error');
    }
  };

  const handleSavePassword = async () => {
    if (!newPassword) {
        toast.error('New password cannot be empty');
        return;
    }
    if (newPassword !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
    }
    if (newPassword.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
    }

    try {
        const username = sessionStorage.getItem('username'); 
        const response = await api.put(`/admin/changePassword/${username}`, {
            currentPassword,
            newPassword,
        });

        if (response.status === 200) {
            toast.success('Password changed successfully');
            setOpenChangePassword(false);
            setOpenModal(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    } catch (error) {
        toast.error('Failed to change password');
    }
};

  const handleSave = async () => {
    try {
      const updatedData = { firstName, lastName, email, contactNo };
      const username = sessionStorage.getItem('username');
      const response = await api.put(`/admin/putAdminRecord/${username}`, updatedData);

      if (response.status === 200) {
        sessionStorage.setItem('firstName', firstName);
        sessionStorage.setItem('lastName', lastName);
        sessionStorage.setItem('email', email);
        sessionStorage.setItem('contactNo', contactNo);

        setEditMode(false);
        showToast('Profile updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      showToast('Failed to update admin record.', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    const username = sessionStorage.getItem('username');
    try {
      const response = await api.delete(`/admin/deleteAdminRecord/${username}`);

      if (response.status === 200) {
        showToast(response.data, 'success');
        sessionStorage.clear();
        window.location.href = '/admin';
      } else {
        console.error('Error deleting user account:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting user account:', error);
      showToast('Failed to delete account.', 'error');
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

  useEffect(() => {
    const fetchProfileData = async () => {
        const username = sessionStorage.getItem('username');
        try {
            const response = await api.get(`/admin/getAdminRecord/${username}`);
            console.log(response.data);
            if (response.status === 200) {
                const { firstName, lastName, email, contactNo, profilePhoto } = response.data;

                setUsername(username);
                setFirstName(firstName);
                setLastName(lastName);
                setEmail(email);
                setContactNo(contactNo);

                if (profilePhoto) {
                  setPreviewImage(`http://localhost:8080/uploads/${profilePhoto}`);
              }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    fetchProfileData();
  }, []);


  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Account Settings</Typography>
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={previewImage ? previewImage : 'default-placeholder-url'}
            sx={{ bgcolor: '#8A252C', width: 150, height: 150, marginRight: 2 }}
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Typography sx={{ marginBottom: 1, fontSize: { xs: '18px', sm: '16px', md: '14px' } }}>
              Clear frontal face photos are an important way for buyers and sellers to learn about each other.
            </Typography>
            <Box>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
                id="profile-upload"
              />
              <Button
                variant="outlined"
                onClick={() => document.getElementById('profile-upload').click()}
                sx={{ mt: 1, borderColor: '#8A252C', color: '#8A252C', textTransform: 'none' }}
              >
                Upload a photo
              </Button>
              <Button
                variant="outlined"
                onClick={handleUploadProfileImage}
                sx={{ mt: 1, borderColor: '#8A252C', color: '#8A252C', marginLeft: '5px', textTransform: 'none' }}
              >
                Save
              </Button>
            </Box>
          </Box>
        </Box>
        <Typography variant="h6" sx={{ marginTop: 3, marginBottom: 1 }}>
          Public Profile
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="grey">Username</Typography>
          <Typography variant="body1">{username}</Typography>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="grey">First Name</Typography>
          {editMode ? (
            <TextField
              fullWidth
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          ) : (
            <Typography variant="body1">{firstName}</Typography>
          )}
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="grey">Last Name</Typography>
          {editMode ? (
            <TextField
              fullWidth
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          ) : (
            <Typography variant="body1">{lastName}</Typography>
          )}
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="grey">Password</Typography>
          <Typography variant="body1">********  </Typography>
          <Button
            variant="outlined"
            onClick={handleChangePassword}
            sx={{ mt: 1, color: 'black', borderColor: 'rgba(0, 0, 0, 0.23)', borderRadius: '20px', textTransform: 'none', marginLeft: '0px' }}
          >
            Change Password
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 3, marginBottom: 1 }}>
          <LockOutlinedIcon sx={{ marginRight: 1 }} />
          <Typography variant="h6">Private Information</Typography>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="grey">Email</Typography>
          {editMode ? (
            <TextField
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          ) : (
            <Typography variant="body1" color="black">{email}</Typography>
          )}
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="grey">Contact No.</Typography>
          {editMode ? (
            <TextField
              fullWidth
              value={contactNo}
              onChange={(e) => setContactNo(e.target.value)}
            />
          ) : (
            <Typography variant="body1" color="black">{contactNo}</Typography>
          )}
        </Box>

        <Dialog open={openModal} onClose={handleCloseModal}>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            {/* Add your form fields for the current and new passwords here */}
            <TextField
              label="Current Password"
              type="password"
              fullWidth
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              sx={{ mt: 2 }}
            />
            <TextField
              label="New Password"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mt: 2 }}
            />
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="primary">
              Cancel
            </Button>
            <Button
              onClick={handleSavePassword} // Define this to save the new password
              color="primary"
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>


        <Button
          variant="outlined"
          onClick={editMode ? handleOpenConfirmUpdate : toggleEditMode}
          sx={{ mt: 3, color: 'black', borderColor: 'rgba(0, 0, 0, 0.23)', borderRadius: '20px', textTransform: 'none' }}
        >
          {editMode ? 'Save Changes' : 'Edit Information'}
        </Button>
        <Button
          variant="outlined"
          onClick={handleOpenConfirmDelete}
          sx={{ mt: 3, color: 'black', borderColor: 'rgba(0, 0, 0, 0.23)', borderRadius: '20px', textTransform: 'none', marginLeft: '5px' }}
        >
          Delete Account
        </Button>

        {/* Update Confirmation Dialog */}
        <Dialog open={openConfirmUpdate} onClose={handleCloseConfirmUpdate}>
          <DialogTitle>Confirm Update</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to update your account information?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirmUpdate} color="primary">
              Cancel
            </Button>
            <Button onClick={() => {
              handleCloseConfirmUpdate();
              handleSave();
            }} color="primary" variant="contained">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openConfirmDelete} onClose={handleCloseConfirmDelete}>
          <DialogTitle>Confirm Account Deletion</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete your account? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirmDelete} color="primary">
              Cancel
            </Button>
            <Button onClick={() => {
              handleCloseConfirmDelete();
              handleDeleteAccount();
            }} color="error" variant="contained">
              Delete Account
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>

      <ToastManager toasts={toasts} handleClose={(id) => {
        setToasts(current => 
          current.map(toast => 
            toast.id === id ? { ...toast, open: false } : toast
          )
        );
      }} />
    </Box>
  );
};

export default AdminSettings;
