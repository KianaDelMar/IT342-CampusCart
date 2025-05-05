import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Button, Divider, TextField, List, ListItem, ListItemIcon, ListItemText, Paper, Dialog, DialogActions, DialogContent, DialogTitle, Alert } from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PropTypes from 'prop-types';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import axios from 'axios';
import '../../App.css';
import toast from 'react-hot-toast';
import ToastManager from '../../components/ToastManager';
import { useNavigate } from 'react-router-dom';
import api from '../../config/axiosConfig';
import { useLoading } from '../../contexts/LoadingContext';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}
const UserAccount = (props) => {
    const [value, setValue] = useState(0);
    const [username, setUsername] = useState(sessionStorage.getItem('username') || '');
    const [firstName, setFirstName] = useState(sessionStorage.getItem('firstName') || '');
    const [lastName, setLastName] = useState(sessionStorage.getItem('lastName') || '');
    const [email, setEmail] = useState(sessionStorage.getItem('email') || '');
    const [address, setAddress] = useState(sessionStorage.getItem('address') || '');
    const [contactNo, setContactNo] = useState(sessionStorage.getItem('contactNo') || '');
    const [editMode, setEditMode] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [openConfirmUpdate, setOpenConfirmUpdate] = useState(false);
    const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
    const [isGoogleUser, setIsGoogleUser] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { setLoading } = useLoading();

    // State for Change Password
    const [openChangePassword, setOpenChangePassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const toggleEditMode = () => {
        setLoading(true);
        setEditMode((prev) => !prev);
        setLoading(false);
    };

    const handleOpenModal = () => {
        setLoading(true);
        setOpenModal(true);
        setLoading(false);
    };

    const handleCloseModal = () => {
        setLoading(true);
        setOpenModal(false);
        setLoading(false);
    };

    const handleOpenConfirmUpdate = () => {
        setLoading(true);
        setOpenConfirmUpdate(true);
        setLoading(false);
    };

    const handleCloseConfirmUpdate = () => {
        setLoading(true);
        setOpenConfirmUpdate(false);
        setLoading(false);
    };

    const handleOpenConfirmDelete = () => {
        setLoading(true);
        setOpenConfirmDelete(true);
        setLoading(false);
    };

    const handleCloseConfirmDelete = () => {
        setLoading(true);
        setOpenConfirmDelete(false);
        setLoading(false);
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
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

    const handleSave = async () => {
        setLoading(true);
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address.');
            return;
        }


        const contactRegex = /^09\d{9}$/;
        if (!contactRegex.test(contactNo)) {
            toast.error('Please enter a valid contact number (must be 11 digits and start with 09).');
            return;
        }

        try {
            const updatedData = { firstName, lastName, email, address, contactNo };
            const username = sessionStorage.getItem('username');

            const response = await api.put(`/user/putUserRecord/${username}`, updatedData);

            if (response.status === 200) {
                sessionStorage.setItem('firstName', firstName);
                sessionStorage.setItem('lastName', lastName);
                sessionStorage.setItem('email', email);
                sessionStorage.setItem('address', address);
                sessionStorage.setItem('contactNo', contactNo);

                setEditMode(false);
                showToast('Profile updated successfully!', 'success');
            }
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setLoading(true);
        const username = sessionStorage.getItem('username');
        try {
            const response = await api.delete(`/user/deleteUserRecord/${username}`);
            if (response.status === 200) {
                showToast(response.data, 'success');
                sessionStorage.clear();
                window.location.href = '/';
            } else {
                console.error('Error deleting user account:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting user account:', error);
            showToast('Failed to delete account.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        setLoading(true);
        if (
            !newPassword ||
            !confirmPassword ||
            !currentPassword
        ) {
            setErrorMessage('All fields are required. Please fill out the entire form.');
            setIsLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage('Password do not match.');
            return;
        }

        if (newPassword.length < 8) {
            setErrorMessage('Password must be at least 8 characters long.');
            return;
        }

        if (!/[A-Z]/.test(newPassword)) {
            setErrorMessage('Password must include at least one uppercase letter.');
            setIsLoading(false);
            return;
        }
        if (!/[a-z]/.test(newPassword)) {
            setErrorMessage('Password must include at least one lowercase letter.');
            setIsLoading(false);
            return;
        }
        if (!/[0-9]/.test(newPassword)) {
            setErrorMessage('Password must include at least one number.');
            setIsLoading(false);
            return;
        }
        if (!/[^A-Za-z0-9]/.test(newPassword)) {
            setErrorMessage('Password must include at least one symbol.');
            setIsLoading(false);
            return;
        }

        try {
            const username = sessionStorage.getItem('username');
            const response = await api.put(`/user/changePassword/${username}`, {
                currentPassword,
                newPassword,
            });

            if (response.status === 200) {
                toast.success('Password changed successfully');
                setOpenChangePassword(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                navigate('/login');
            }
        } catch (error) {
            toast.error('Failed to change password');
        } finally {
            setLoading(false);
        }           
    };


    const handleImageChange = (e) => {
        setLoading(true);
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
        setLoading(false);
    };

    const handleUploadProfileImage = async () => {      
        setLoading(true);
        if (!profileImage) {
            toast.error('Please select an image first');
            return;
        }

        const username = sessionStorage.getItem('username');
        const formData = new FormData();
        formData.append('file', profileImage);

        try {
            const response = await api.post(`/user/uploadProfilePhoto/${username}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });

            if (response.status === 200) {
                toast.success('Profile picture updated successfully');
                setPreviewImage(`http://localhost:8080/uploads/${response.data.fileName}`);
            }
        } catch (error) {
            console.error('Error uploading profile photo: ', error);
            toast.error('Failed to upload profile photo');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        const fetchProfileData = async () => {
            const username = sessionStorage.getItem('username');
            try {
                const response = await api.get(`/user/getUserRecord/${username}`);

                if (response.status === 200) {
                    const { firstName, lastName, email, address, contactNo, profilePhoto, googleId } = response.data;

                    setFirstName(firstName);
                    setLastName(lastName);
                    setEmail(email);
                    setAddress(address);
                    setContactNo(contactNo);
                    setUsername(username);
                    setIsGoogleUser(!!googleId);

                    if (profilePhoto) {
                        setPreviewImage(`http://localhost:8080/uploads/${profilePhoto}`);
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);


    return (
        <Box
            sx={{
                display: 'flex',
                padding: '50px'
            }}
        >
            {/* Vertical Tabs */}
            <Tabs
                orientation="vertical"
                variant="scrollable"
                value={value}
                onChange={handleChange}
                textColor="black"
                aria-label="Vertical tabs example"
                sx={{
                    borderRight: 1,
                    borderColor: 'divider',
                    width: '250px',
                    '& .MuiTabs-indicator': {
                        backgroundColor: '#8A252C'
                    },
                    '& .MuiTab-root': {
                        cursor: 'pointer',
                        '&:hover': {
                            color: '#8A252C',
                            backgroundColor: 'transparent'
                        }
                    }
                }}
            >
                <Tab label="Personal Info" {...a11yProps(0)} />
                {!isGoogleUser && <Tab label="Change Password" {...a11yProps(1)} />}
            </Tabs>

            <TabPanel value={value} index={0}>
                <Paper elevation={1} sx={{ padding: 3, marginTop: '-25px', backgroundColor: '#f0f0f0', border: '2px solid #8A252C', borderRadius: '10px' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Edit Profile</Typography>
                    <Typography variant="h6" sx={{ marginTop: 5, marginBottom: 1, fontWeight: '600' }}>
                        Profile Photo
                    </Typography>
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
                    <Typography variant="h6" sx={{ marginTop: 3, marginBottom: 1, fontWeight: '600' }}>
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
                        <Typography variant="body2" color="grey">Address</Typography>
                        {editMode ? (
                            <TextField
                                fullWidth
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        ) : (
                            <Typography variant="body1" color="black">{address}</Typography>
                        )}
                    </Box>
                    <Typography variant="h6" sx={{ marginTop: 3, marginBottom: 1, fontWeight: '600' }}>
                        Private Information
                    </Typography>
                    <LockOutlinedIcon style={{ verticalAlign: 'middle', marginBottom: '5px', marginLeft: '-5px' }} />
                    <span style={{ marginLeft: '10px', textDecoration: 'none', color: 'inherit', fontSize: '14px' }}>We do not share this information with other users unless explicit permission is given by you.</span>
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
            </TabPanel>

            {!isGoogleUser && (
                <TabPanel value={value} index={1}>
                    <Paper elevation={1} sx={{ padding: 3, marginTop: '-25px', backgroundColor: '#f0f0f0', border: '2px solid #8A252C', borderRadius: '10px' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Change Password</Typography>
                        {errorMessage && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {errorMessage}
                            </Alert>
                        )}
                        <Box sx={{ mt: 2 }}>
                            <TextField
                                margin="dense"
                                label="Current Password"
                                type="password"
                                fullWidth
                                variant="outlined"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                            <TextField
                                margin="dense"
                                label="New Password"
                                type="password"
                                fullWidth
                                variant="outlined"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <TextField
                                margin="dense"
                                label="Confirm New Password"
                                type="password"
                                fullWidth
                                variant="outlined"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </Box>
                        <Button onClick={handleChangePassword} color="primary" variant="outlined" sx={{ mt: 1, borderColor: '#8A252C', color: '#8A252C' }}  >Change Password</Button>
                    </Paper>
                </TabPanel>
            )}

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

export default UserAccount;