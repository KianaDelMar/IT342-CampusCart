import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
    Grid,
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    InputAdornment,
    Alert,
} from '@mui/material';
import { Person, Email, Lock, LocationOn, Phone, AccountCircle } from '@mui/icons-material';
import logo from '../../assets/img/logocit-1.png';
import cit from '../../assets/img/cit-1.jpg';
import { toast } from 'react-hot-toast';

const Register = () => {
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        address: '',
        contactNo: '',
        email: '',
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Create a new seller
    const createUser = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Check if all fields are filled
        if (
            !newUser.username ||
            !newUser.password ||
            !newUser.firstName ||
            !newUser.lastName ||
            !newUser.address ||
            !newUser.contactNo ||
            !newUser.email
        ) {
            setErrorMessage('All fields are required. Please fill out the entire form.');
            setIsLoading(false);
            return;
        }

        // Password validation
        if (newUser.password.length < 8) {
            setErrorMessage('Password must be at least 8 characters long.');
            setIsLoading(false);
            return;
        }

        // Contact number validation
        if (!newUser.contactNo.trim()) {
            setErrorMessage('Contact number is required');
            setIsLoading(false);
            return;
        } else if (!/^\d+$/.test(newUser.contactNo)) {
            setErrorMessage('Contact number must contain only numbers');
            setIsLoading(false);
            return;
        } else if (newUser.contactNo.length !== 11) {
            setErrorMessage('Contact number must be exactly 11 digits');
            setIsLoading(false);
            return;
        } else if (!newUser.contactNo.startsWith('09')) {
            setErrorMessage('Contact number must start with 09');
            setIsLoading(false);
            return;
        }

        try {
            // Attempt to create seller by sending the data to the server
            const response = await axios.post('http://localhost:8080/api/user/postUserRecord', newUser);
            setErrorMessage('');
            setNewUser({
                username: '',
                password: '',
                firstName: '',
                lastName: '',
                address: '',
                contactNo: '',
                email: '',
            });
            
            toast.success('Registration successful!', {
                duration: 2000
            });
            
            // Delay navigation slightly to show toast
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error) {
            if (error.response && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('An unexpected error occurred. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleContactNoChange = (e) => {
        const value = e.target.value;
        
        // Only allow numbers
        if (!/^\d*$/.test(value)) {
            setErrorMessage('Contact number must contain only numbers');
            return;
        }

        // Must start with 09
        if (value.length >= 2 && !value.startsWith('09')) {
            setErrorMessage('Contact number must start with 09');
            return;
        }

        // Must be exactly 11 digits
        if (value.length > 11) {
            setErrorMessage('Contact number must be exactly 11 digits');
            return;
        }

        setErrorMessage('');
        setNewUser({ ...newUser, contactNo: value });
    };

    return (
        <Grid container sx={{ minHeight: '100vh', overflow: 'hidden' }}>
            {/* Left Side: Image */}
            <Grid
                sx={{
                    backgroundImage: `url(${cit})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: { xs: 'none', md: 'block' },
                    position: 'fixed',
                    height: '100vh',
                    width: '50%',
                    left: 0,
                    top: 0
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: '10%',
                        left: '10%',
                        color: '#fff',
                        zIndex: 1,
                    }}
                >
                    <Typography variant="h3" fontWeight="bold">
                        Join the CIT-U Marketplace
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Connect with your campus community and start selling today!
                    </Typography>
                </Box>
            </Grid>

            {/* Right Side: Registration Form */}
            <Grid
                sx={{
                    width: { xs: '100%', md: '50%' },
                    padding: { xs: 4, md: 8 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: { xs: 0, md: '50%' }
                }}
            >
                <Paper
                    elevation={6}
                    sx={{
                        maxWidth: 500,
                        width: '100%',
                        p: 4,
                        borderRadius: 3,
                        textAlign: 'center',
                        backgroundColor: '#fff',
                    }}
                >
                    <Box sx={{ mb: 4 }}>
                        <img src={logo} alt="Logo" style={{ maxWidth: '120px' }} />
                    </Box>
                    <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
                        Create Your Account
                    </Typography>
                    {errorMessage && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {errorMessage}
                        </Alert>
                    )}
                    <form onSubmit={createUser}>
                        <TextField
                            fullWidth
                            label="Username"
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AccountCircle color="white" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            label="First Name"
                            value={newUser.firstName}
                            onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person color="white" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Last Name"
                            value={newUser.lastName}
                            onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person color="white" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Address"
                            value={newUser.address}
                            onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LocationOn color="white" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Contact No"
                            value={newUser.contactNo}
                            onChange={handleContactNoChange}
                            error={!!errorMessage && errorMessage.includes('Contact number')}
                            helperText={errorMessage && errorMessage.includes('Contact number') ? errorMessage : ''}
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Phone color="white" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email color="white" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock color="white" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={isLoading}
                            sx={{
                                backgroundColor: '#8A252C',
                                py: 1.5,
                                borderRadius: '25px',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                            }}
                        >
                            {isLoading ? 'Registering...' : 'Sign Up'}
                        </Button>
                    </form>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                        Already have an account?{' '}
                        <RouterLink to="/" style={{ textDecoration: 'none', color: '#8A252C', fontWeight: 'bold' }}>
                            Login
                        </RouterLink>
                    </Typography>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default Register;