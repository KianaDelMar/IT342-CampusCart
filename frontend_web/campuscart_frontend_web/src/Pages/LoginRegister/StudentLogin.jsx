import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
    Box,
    Grid,
    Typography,
    TextField,
    Button,
    Link,
    Alert,
    Paper,
    InputAdornment,
} from '@mui/material';
import { Person, Lock } from '@mui/icons-material';
import logo from '../../assets/img/logocit-1.png';
import cit from '../../assets/img/cit-1.jpg';

const StudentLogin = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    console.log('Image path:', cit);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!credentials.username || !credentials.password) {
            setErrorMessage('Please enter username and password');
            return;
        }

        console.log('Logging in with credentials:', credentials);
        try {
            const response = await axios.post('http://localhost:8080/api/user/login', credentials);
            console.log('Login Successful', response.data);
            const userData = response.data;

            login(userData);
            setErrorMessage('');
            navigate('/home');
        } catch (error) {
            setErrorMessage('Invalid username or password');
            console.error('Error logging in: ', error);
        }
    };

    return (
        <Grid container sx={{ minHeight: '100vh' }}>
            {/* Left Side: Image */}
            <Grid
                sx={{
                    backgroundImage: `url(${cit})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: { xs: 'none', md: 'block' },
                    position: 'relative',
                    height: '100vh',
                    width: { xs: '100%', md: '50%' }
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
                        Empower Your Campus
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Seamlessly connect, buy, and sell with your fellow students.
                    </Typography>
                </Box>
            </Grid>

            {/* Right Side: Form */}
            <Grid
                sx={{
                    width: { xs: '100%', md: '50%' },
                    padding: { xs: 4, md: 8 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Paper
                    elevation={6}
                    sx={{
                        maxWidth: 450,
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
                        Welcome Back
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Student Access Module
                    </Typography>
                    {errorMessage && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {errorMessage}
                        </Alert>
                    )}
                    <TextField
                        fullWidth
                        label="Username"
                        variant="outlined"
                        value={credentials.username}
                        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                        sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '25px',
                                backgroundColor: '#f9f9f9',
                            },
                            '& .MuiOutlinedInput-root:hover': {
                                backgroundColor: '#f1f1f1',
                            },
                            '& .MuiOutlinedInput-root.Mui-focused': {
                                backgroundColor: '#fff',
                                borderColor: 'primary.main',
                            },
                        }}
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
                        type="password"
                        label="Password"
                        variant="outlined"
                        value={credentials.password}
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        sx={{
                            mb: 3,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '25px',
                                backgroundColor: '#f9f9f9',
                            },
                            '& .MuiOutlinedInput-root:hover': {
                                backgroundColor: '#f1f1f1',
                            },
                            '& .MuiOutlinedInput-root.Mui-focused': {
                                backgroundColor: '#fff',
                                borderColor: 'primary.main',
                            },
                        }}
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
                        onClick={handleLogin}
                        sx={{
                            backgroundColor: '#8A252C',
                            py: 1.5,
                            borderRadius: '25px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            transition: 'background-color 0.3s ease',
                        }}
                    >
                        Login
                    </Button>

                    <Typography variant="body2" sx={{ mt: 2 }}>
                        Don't have an account?{' '}
                        <Link
                            component={RouterLink}
                            to="/register"
                            underline="none"
                            sx={{
                                fontWeight: 'bold',
                                color: '#8A252C',
                                textDecoration: 'none',
                                '&:hover': {
                                    textDecoration: 'underline',
                                },
                            }}
                        >
                            Register
                        </Link>
                    </Typography>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default StudentLogin;

