import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardMedia, CardContent, Button, Grid, Avatar, Modal, IconButton } from '@mui/material';
import axios from 'axios';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UpdateProductForm from '../Sell/UpdateProductForm';
import '../../App.css';
import { toast } from "react-hot-toast";
import api from '../../config/axiosConfig';

const SellerView = () => {
  const { code } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [sellerUsername, setSellerUsername] = useState('');
  const [imageError, setImageError] = useState(false);

  const fetchProductDetails = async () => {
    try {
      const response = await api.get(`/product/getProductByCode/${code}`);
      console.log("Response: ", response.data);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const username = sessionStorage.getItem('username');
    if (username) {
      setSellerUsername(username);
    } else {
      alert('Please log in to add a product');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    fetchProductDetails();
  }, [code]);

  if (loading) {
    return <Typography variant="h6">Loading product details...</Typography>;
  }

  if (!product) {
    return <Typography variant="h6">Product not found.</Typography>;
  }

  const handleUpdate = () => {
    setEditing(true);
  };

  const handleBack = () => {
    navigate(-1); 
  };

  //Deletes Products
  const handleDelete = () => {
    toast((t) => (
      <div>
        <div style={{
          fontSize: '16px',
          marginBottom: '15px',
          color: '#333',
          fontWeight: '500'
        }}>
          Are you sure you want to delete this product?
        </div>
        <div style={{ display: 'flex', gap: '2px', justifyContent: 'flex-end', margin: 0 }}>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              padding: '8px 16px',
              background: '#f5f5f5',
              color: '#666',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              margin: 0
            }}
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              try {
                await api.delete(`/product/deleteProduct/${code}`);
                toast.success('Product deleted successfully');
                toast.dismiss(t.id);
                navigate('/profile');
              } catch (error) {
                console.error('Error deleting product:', error);
                toast.error(error.response?.data?.message || 'Failed to delete product');
              }
            }}
            style={{
              padding: '8px 16px',
              background: '#89343b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              margin: 0
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
      style: {
        background: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        margin: 0,
        padding: '16px 16px 8px 16px'
      }
    });
  };

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
        maxWidth: '800px',
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
                  >
                    {sellerUsername}
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
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Status:</strong>{' '}
                  <span style={{
                    color: product.status === 'Available' ? '#2ecc71' : '#e74c3c'
                  }}>
                    {product.status}
                  </span>
                </Typography>
                <Typography variant="body1">
                  <strong>Feedback:</strong>{' '}
                  <span style={{ color: '#666' }}>
                    {product.feedback}
                  </span>
                </Typography>
                <Typography variant="body1">
                  <strong>Condition:</strong>{' '}
                  <span style={{ color: '#666' }}>
                    {product.conditionType}
                  </span>
                </Typography>
                <Typography variant="body1">
                  <strong>Category:</strong>{' '}
                  <span style={{ color: '#666' }}>
                    {product.category}
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
                onClick={handleUpdate}
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
                Update Product
              </Button>
              <Button
                variant="outlined"
                onClick={handleDelete}
                sx={{
                  borderColor: '#89343b',
                  color: '#89343b',
                  px: 4,
                  py: 1.5,
                  borderRadius: '8px',
                  '&:hover': {
                    bgcolor: 'rgba(137, 52, 59, 0.1)',
                    transform: 'translateY(-2px)',
                    borderColor: '#6d2a2f',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                Delete Product
              </Button>
            </Box>
          </CardContent>
        </Grid>
      </Card>

      {/* Update Product Modal */}
      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        aria-labelledby="update-product-modal"
        aria-describedby="update-product-form"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', md: '80%' },
          maxWidth: '800px',
          bgcolor: 'background.paper',
          borderRadius: '12px',
          boxShadow: 24,
          p: 4,
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <UpdateProductForm 
            product={product} 
            onClose={() => setEditing(false)}
            onUpdateSuccess={() => {
              setEditing(false);
              fetchProductDetails(); // Refresh the product data
            }}
            setProduct={setProduct}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default SellerView;