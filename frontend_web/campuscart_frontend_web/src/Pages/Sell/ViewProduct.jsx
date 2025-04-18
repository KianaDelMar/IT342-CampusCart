import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardMedia, CardContent, Button, Grid, Avatar, IconButton } from '@mui/material';
import axios from 'axios';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MessageIcon from '@mui/icons-material/Message';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import '../../App.css';
import api from '../../config/axiosConfig';

const ViewProduct = () => {
    const { code } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [userUsername, setUserUsername] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const navigate = useNavigate();
    const loggedInUser = sessionStorage.getItem('username');
    console.log("Logged-in user:", loggedInUser); // ✅ Add this for debugging

    useEffect(() => {
        const username = sessionStorage.getItem('username');
        if (username) {
            setUserUsername(username);
        } else {
            alert('Please log in to view product details');
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const response = await api.get(`/product/getProductByCode/${code}`);
                setProduct(response.data);
                setLoading(false);

                // Fetch seller username
                const apiResponse = await api.get(`/product/getUserByProductCode/${code}`);
                if (apiResponse.status === 200) {
                    setUserUsername(apiResponse.data.userUsername);
                }
            } catch (error) {
                console.error('Error fetching product or seller details:', error);
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [code]);

    useEffect(() => {
        const fetchAllProducts = async () => {
            setLoading(true);

            try {
                const response = await api.get(`/product/getAllProducts/${loggedInUser}`);
                if (response.status === 200) {
                    const approvedProducts = response.data.filter(product => product.status && product.status.toLowerCase() === 'approved');
                    const { sellerPhoto } = response.data;
                    setAllProducts(approvedProducts);
                    setFilteredProducts(approvedProducts);
                }
            } catch (error) {
                console.error("Error fetching all products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllProducts();
    }, [loggedInUser]);

    useEffect(() => {
        const likedProducts = JSON.parse(localStorage.getItem('likedProducts')) || [];
        if (likedProducts.includes(product?.code)) {
            setLiked(true);
        }
    }, [product?.code]);

    const handleCardClick = (code) => {
        navigate(`product/${code}`);
    };

    const handleChatRedirect = () => {
        navigate(`/message`); //navigate(`/message/${sellerUsername}`);
    };

    const handleLikeToggle = () => {
        const likedProducts = JSON.parse(localStorage.getItem('likedProducts')) || [];

        if (liked) {
            const updatedLikes = likedProducts.filter((id) => id !== product.code);
            localStorage.setItem('likedProducts', JSON.stringify(updatedLikes));
        } else {
            likedProducts.push(product.code);
            localStorage.setItem('likedProducts', JSON.stringify(likedProducts));
        }

        window.dispatchEvent(new Event('likesUpdated'));
        setLiked(!liked);
    };

    const handleBack = () => {
        navigate(-1); 
    };

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                bgcolor: '#f5f5f5' 
            }}>
                <Typography variant="h6">Loading product details...</Typography>
            </Box>
        );
    }

    if (!product) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                bgcolor: '#f5f5f5' 
            }}>
                <Typography variant="h6">Product not found.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ 
            padding: { xs: '16px', md: '32px' }, 
            minHeight: '100vh',
            bgcolor: '#f5f5f5',
            position: 'relative'
        }}>
            {/* Back Button */}
            <IconButton
                onClick={handleBack}
                sx={{
                    position: 'absolute',
                    left: { xs: '16px', md: '32px' },
                    top: { xs: '16px', md: '32px' },
                    bgcolor: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': {
                        bgcolor: '#f5f5f5',
                        transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease-in-out',
                    zIndex: 1,
                }}
            >
                <ArrowBackIcon sx={{ color: '#89343b' }} />
            </IconButton>

            <Card sx={{ //card styling
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                width: { xs: '95%', md: '80%' },
                maxWidth: '1000px',
                minHeight: { xs: 'auto', md: '60vh' },
                margin: '32px auto',
                overflow: 'hidden',
                bgcolor: 'white',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-4px)',
                }
            }}>
                {/* Product Image */}
                <Grid item xs={12} md={5} sx={{
                    position: 'relative',
                    minHeight: { xs: '250px', sm: '300px', md: '100%' },
                    width: { xs: '100%', md: '40%' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f8f8f8',
                    overflow: 'hidden'
                }}>
                    <CardMedia
                        component="img"
                        alt={product.name}
                        image={`http://localhost:8080/${product.imagePath}`}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease-in-out',
                            '&:hover': {
                                transform: 'scale(1.05)',
                            }
                        }}
                    />
                </Grid>

                {/* Product Details */}
                <Grid item xs={12} md={7}>
                    <CardContent sx={{
                        padding: { xs: '20px', md: '32px' },
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        maxWidth: '800px',
                        margin: '0 auto',
                        gap: 2
                    }}>
                        <Box sx={{ flex: 1, overflow: 'auto' }}>
                            <Typography variant="h3" sx={{
                                fontWeight: 'bold',
                                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                                color: '#2C3E50',
                                mb: 2
                            }}>
                                {product.name}
                            </Typography>

                            <Typography 
                                variant="h5" 
                                sx={{ 
                                    fontWeight: 'bold', 
                                    color: '#89343b',
                                    mb: 2
                                }}
                            >
                                PHP {product.buyPrice.toFixed(2)}
                            </Typography>

                            {/* User Info */}
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                mb: 3,
                                p: 2,
                                borderRadius: '8px'
                            }}>
                                <Avatar
                                    src={!imageError && product.userProfileImagePath ?
                                        `http://localhost:8080/uploads/${product.userProfileImagePath}` :
                                        `https://ui-avatars.com/api/?name=${product.userUsername}&background=89343b&color=fff`
                                    }
                                    alt={product.userUsername}
                                    onError={() => setImageError(true)}
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        marginRight: 2,
                                        bgcolor: '#89343b',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        '& .MuiAvatar-img': {
                                            objectFit: 'cover'
                                        }
                                    }}
                                />
                                <Box>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            color: '#2C3E50',
                                            '&:hover': {
                                                color: '#89343b',
                                            }
                                        }}
                                        onClick={() => navigate(`/profile/${userUsername}`)}
                                    >
                                        {userUsername}
                                    </Typography>

                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                        {[...Array(5)].map((_, index) => (
                                            <StarIcon
                                                key={index}
                                                sx={{
                                                    color: '#FFD700',
                                                    fontSize: '18px',
                                                    mr: 0.2
                                                }}
                                            />
                                        ))}
                                        <Typography
                                            variant="body2"
                                            sx={{ 
                                                ml: 1,
                                                color: '#666'
                                            }}
                                        >
                                            5.0 | 10K+ Sold
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Product Description */}
                            <Typography 
                                variant="body1" 
                                sx={{ 
                                    color: '#555',
                                    mb: 3,
                                    lineHeight: 1.6
                                }}
                            >
                                {product.pdtDescription}
                            </Typography>

                            {/* Product Details */}
                            <Box sx={{ 
                                mb: 3,
                                p: 2,
                                bgcolor: '#f8f8f8',
                                borderRadius: '8px'
                            }}>
                                <Typography variant="body1">
                                    <strong>Condition:</strong>{' '}
                                    <span style={{ color: '#666' }}>
                                        {product.conditionType}
                                    </span>
                                </Typography>
                            </Box>
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{
                            display: 'flex',
                            gap: '16px',
                            py: 2,
                            borderTop: '1px solid #eee',
                            mt: 'auto',
                            flexWrap: 'wrap',
                            justifyContent: { xs: 'center', md: 'flex-start' },
                            backgroundColor: 'white',
                            position: 'sticky',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            zIndex: 1
                        }}>
                            <Button
                                variant="contained"
                                onClick={handleChatRedirect}
                                startIcon={<MessageIcon />}
                                sx={{
                                    bgcolor: '#89343b',
                                    color: 'white',
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: '8px',
                                    '&:hover': {
                                        bgcolor: '#6d2a2f',
                                        transform: 'translateY(-2px)',
                                    },
                                    transition: 'all 0.2s ease-in-out',
                                }}
                            >
                                Message Seller
                            </Button>
                            <IconButton
                                onClick={handleLikeToggle}
                                sx={{
                                    bgcolor: liked ? 'rgba(137, 52, 59, 0.1)' : 'white',
                                    border: '2px solid #89343b',
                                    p: 1.5,
                                    '&:hover': {
                                        bgcolor: 'rgba(137, 52, 59, 0.2)',
                                    },
                                }}
                            >
                                {liked ? (
                                    <FavoriteIcon sx={{ color: '#89343b', fontSize: '24px' }} />
                                ) : (
                                    <FavoriteBorderIcon sx={{ color: '#89343b', fontSize: '24px' }} />
                                )}
                            </IconButton>
                        </Box>
                    </CardContent>
                </Grid>
            </Card>
        </Box>
    );
};

export default ViewProduct;
