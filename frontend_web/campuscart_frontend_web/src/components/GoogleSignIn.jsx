import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../config/axiosConfig';
import { toast } from 'react-hot-toast';
import { Box, Typography, Divider } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

const GoogleSignIn = () => {
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            const { email, name, picture } = decoded;

            // Send the Google user data to your backend
            const response = await api.post('/auth/google', {
                email,
                name,
                profilePhoto: picture,
                googleId: decoded.sub
            });

            if (response.data && response.data.token) {
                // Clear any existing session data
                sessionStorage.clear();
                
                // Store the new token and user data
                sessionStorage.setItem('token', response.data.token);
                sessionStorage.setItem('username', response.data.username);
                sessionStorage.setItem('email', response.data.email);
                sessionStorage.setItem('firstName', response.data.firstName);
                sessionStorage.setItem('lastName', response.data.lastName);
                sessionStorage.setItem('role', 'USER');
                
                // Log the stored token for verification
                console.log('Stored token:', response.data.token);
                
                toast.success('Successfully logged in with Google!');
                navigate('/home');
            } else {
                throw new Error('No token received from server');
            }
        } catch (error) {
            console.error('Google login error:', error);
            toast.error('Failed to login with Google');
        }
    };

    return (
        <Box 
            sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                width: '100%'
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    my: 2
                }}
            >
                <Divider sx={{ flex: 1, borderColor: 'rgba(0, 0, 0, 0.12)' }} />
                <Typography variant="body2" color="text.secondary">
                    OR
                </Typography>
                <Divider sx={{ flex: 1, borderColor: 'rgba(0, 0, 0, 0.12)' }} />
            </Box>
            
            <Box
                sx={{
                    width: '100%',
                    '& > div': {
                        width: '100% !important',
                        display: 'flex !important',
                        justifyContent: 'center !important',
                    },
                    '& > div > div': {
                        width: '100% !important',
                        display: 'flex !important',
                        justifyContent: 'center !important',
                        '& > div': {
                            width: '100% !important',
                            maxWidth: 'none !important'
                        }
                    },
                    '& iframe': {
                        scale: '1.2 !important',
                        marginTop: '4px !important',
                        marginBottom: '4px !important'
                    }
                }}
            >
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                        console.log('Login Failed');
                        toast.error('Google login failed');
                    }}
                    theme="outline"
                    size="large"
                    text="continue_with"
                    shape="rectangular"
                    width="100%"
                />
            </Box>
        </Box>
    );
};

export default GoogleSignIn;

