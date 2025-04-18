import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Avatar, Box, Button, Paper, Tabs, Tab, Card, CardContent, CardMedia, Rating } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import axios from 'axios';
import api from '../../config/axiosConfig';
import SellerReviews from './SellerReviews'; // Import the new component
import { mockReviews } from './SellerReviews'; // Import mock reviews

const UserProfile = () => {
    const [tabValue, setTabValue] = useState('1');
    const [username, setUsername] = useState(sessionStorage.getItem('username') || '');
    const [email, setEmail] = useState(sessionStorage.getItem('email') || '');
    const [address, setAddress] = useState(sessionStorage.getItem('address') || '');
    const [profilePhoto, setProfilePhoto] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const loggedInUser = sessionStorage.getItem('username');
    const navigate = useNavigate();

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleCardClick = (code) => {
        navigate(`/sell/product/${code}`);
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get(`/product/getProductsByUser/${loggedInUser}`);
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        const fetchProfileData = async () => {
            const username = sessionStorage.getItem('username');
            try {
                const response = await api.get(`/user/getUserRecord/${username}`);
                console.log("Response: ", response.data)
                if (response.status === 200) {
                    const { email, profilePhoto } = response.data;

                    setUsername(username);
                    setEmail(email);

                    if (profilePhoto) {
                        setProfilePhoto(`http://localhost:8080/uploads/${profilePhoto}`);
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchProfileData();
    }, []);

    const averageRating = products.length > 0 ?
        mockReviews.reduce((sum, review) => sum + review.productQuality, 0) / mockReviews.length : 0;

    return (
        <Container maxWidth="lg" sx={{ paddingTop: 4 }}>
            <Paper
                elevation={3}
                sx={{
                    padding: 4,
                    marginBottom: 3,
                    backgroundImage: 'url("https://marketplace.canva.com/EAEmGBdkt5A/3/0/1600w/canva-blue-pink-photo-summer-facebook-cover-gy8LiIJTTGw.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: 'white',
                    borderRadius: '12px',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
                        zIndex: 1
                    }
                }}
            >
                <Grid container spacing={2} alignItems="center" sx={{ position: 'relative', zIndex: 2 }}>
                    <Grid item>
                        <Box sx={{ position: 'relative', width: 100, height: 100 }}>
                            <Avatar
                                src={profilePhoto}
                                alt="Profile Picture"
                                sx={{
                                    width: 100,
                                    height: 100,
                                    position: 'absolute',
                                    top: -10,
                                    border: '3px solid white',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                }}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs sx={{ textAlign: 'left', marginLeft: 3 }}>
                        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>{username}</Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
                            {email}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            {address}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                            <Box display="flex" alignItems="center" sx={{ gap: 1 }}>
                                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {averageRating.toFixed(1)}
                                    <Rating
                                        value={averageRating}
                                        readOnly
                                        sx={{
                                            color: '#FFD700',
                                            '& .MuiRating-icon': { color: '#FFD700' },
                                        }}
                                    />
                                    <span style={{ opacity: 0.9 }}>({mockReviews.length} Reviews)</span>
                                </Typography>
                            </Box>

                            <Box display="flex" alignItems="center" sx={{ gap: 1 }}>
                                <VerifiedIcon sx={{ color: '#4CAF50' }} />
                                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                    Verified · Very Responsive
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Tabs */}
            <Box sx={{ width: '100%', typography: 'body1' }}>
                <TabContext value={tabValue}>
                    <Box sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        mb: 3
                    }}>
                        <TabList
                            onChange={handleChange}
                            sx={{
                                justifyContent: 'center',
                                '& .MuiTabs-indicator': {
                                    height: '3px',
                                    borderRadius: '2px',
                                    backgroundColor: '#89343b',
                                },
                                '& .MuiTab-root': {
                                    minWidth: 120,
                                    fontSize: '16px',
                                    fontWeight: 500,
                                    color: '#666',
                                    textTransform: 'none',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        color: '#89343b',
                                        backgroundColor: 'transparent',
                                    },
                                    '&.Mui-selected': {
                                        color: '#89343b',
                                        fontWeight: 600,
                                    },
                                },
                                '& .MuiTabs-flexContainer': {
                                    gap: '24px',
                                }
                            }}
                            aria-label="profile tabs"
                            centered
                        >
                            <Tab label="Listings" value="1" />
                            <Tab label="Reviews" value="2" />
                        </TabList>
                    </Box>
                    {/* Listings Tab */}
                    <TabPanel value="1">
                        <Paper elevation={1} sx={{
                            padding: 3,
                            borderRadius: '12px',
                            backgroundColor: '#fff',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}>
                            <Typography variant="h5" gutterBottom sx={{
                                fontWeight: 600,
                                color: '#333',
                                mb: 3
                            }}>
                                My Products
                            </Typography>
                            {loading ? (
                                <Typography variant="h6" sx={{
                                    marginTop: '16px',
                                    color: '#666',
                                    textAlign: 'center'
                                }}>
                                    Loading products...
                                </Typography>
                            ) : products.length === 0 ? (
                                <Typography variant="h6" sx={{
                                    marginTop: '16px',
                                    color: '#666',
                                    textAlign: 'center'
                                }}>
                                    No products available.
                                </Typography>
                            ) : (
                                <Grid container spacing={3} sx={{ marginTop: '20px' }}>
                                    {products.map((product) => (
                                        <Grid item xs={12} sm={6} md={4} lg={3} key={product.code}>
                                            <Card
                                                sx={{
                                                    width: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease-in-out',
                                                    borderRadius: '16px',
                                                    overflow: 'hidden',
                                                    height: '360px',
                                                    backgroundColor: '#fff',
                                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                                    position: 'relative',
                                                    '&:hover': {
                                                        transform: 'translateY(-8px)',
                                                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                                                        '& .MuiCardMedia-root': {
                                                            transform: 'scale(1.05)',
                                                        },
                                                    }
                                                }}
                                                onClick={() => handleCardClick(product.code)}
                                            >
                                                <Box
                                                    sx={{
                                                        position: 'relative',
                                                        width: '100%',
                                                        height: '220px',
                                                        overflow: 'hidden',
                                                        backgroundColor: '#f5f5f5'
                                                    }}
                                                >
                                                    <CardMedia
                                                        component="img"
                                                        alt={product.name}
                                                        image={`http://localhost:8080/${product.imagePath}`}
                                                        sx={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'contain',
                                                            transition: 'transform 0.3s ease-in-out',
                                                        }}
                                                    />
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 12,
                                                            right: 12,
                                                            backgroundColor: product.status === 'Available' ? '#4caf50' : 
                                                                           product.status === 'Pending' ? '#ff9800' : '#f44336',
                                                            color: 'white',
                                                            padding: '4px 12px',
                                                            borderRadius: '12px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                            zIndex: 1
                                                        }}
                                                    >
                                                        {product.status}
                                                    </Box>
                                                </Box>
                                                <CardContent
                                                    sx={{
                                                        p: 2,
                                                        flexGrow: 1,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'space-between',
                                                        height: '140px',
                                                        bgcolor: 'white'
                                                    }}
                                                >
                                                    <Box>
                                                        <Typography
                                                            variant="h6"
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: '#2C3E50',
                                                                mb: 1,
                                                                fontSize: '1rem',
                                                                lineHeight: 1.2,
                                                                height: '2.4em',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical'
                                                            }}
                                                        >
                                                            {product.name}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: '#666',
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                                overflow: 'hidden',
                                                                lineHeight: 1.2,
                                                                height: '2.4em',
                                                                fontSize: '0.875rem',
                                                                mb: 1
                                                            }}
                                                        >
                                                            {product.pdtDescription}
                                                        </Typography>
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            mt: 'auto'
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="h6"
                                                            sx={{
                                                                fontWeight: 700,
                                                                color: '#89343b',
                                                                fontSize: '1.1rem'
                                                            }}
                                                        >
                                                            ₱{product.buyPrice.toFixed(2)}
                                                        </Typography>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Paper>
                    </TabPanel>

                    {/* Reviews Tab */}
                    <TabPanel value="2">
                        <SellerReviews />
                    </TabPanel>
                </TabContext>
            </Box>
            {/* Footer Section */}
            <Box sx={{
                padding: "20px",
                textAlign: "center",
                mt: 4
            }}>
                <Typography variant="body2" sx={{
                    color: "#666",
                    fontSize: '0.9rem'
                }}>
                    © 2024 CIT-U Marketplace. All Rights Reserved.
                </Typography>
            </Box>
        </Container>
    );
};

export default UserProfile;
