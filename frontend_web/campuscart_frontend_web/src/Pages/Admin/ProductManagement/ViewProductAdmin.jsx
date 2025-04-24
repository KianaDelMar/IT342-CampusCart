import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid
} from '@mui/material';

const ViewProductAdmin = ({ open, onClose, product }) => {
  if (!product || !product.product) return null;

  const { product: productDetails, sellerUsername } = product;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          padding: '16px'
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid #e0e0e0',
        pb: 2,
        fontSize: '1.5rem',
        fontWeight: 600
      }}>
        Product Details
      </DialogTitle>
      <DialogContent sx={{ mt: 2, height: '300px' }}>
        <Grid container spacing={3} sx={{ height: '100%' }}>
          {/* Product Image */}
          <Grid item xs={12} md={4} sx={{ height: '100%' }}>
            <Box sx={{ 
              width: '100%',
              height: '100%',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #e0e0e0'
            }}>
              {productDetails.imagePath ? (
                <img 
                  src={`http://localhost:8080/${productDetails.imagePath}`}
                  alt={productDetails.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <Box sx={{ 
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#f5f5f5'
                }}>
                  <Typography color="text.secondary">
                    No image available
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Product Details */}
          <Grid item xs={12} md={8} sx={{ height: '270px' }}>
            <Box sx={{ 
              p: 2, 
              bgcolor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Typography variant="h6" sx={{ color: '#1a237e', mb: 1 }}>
                {productDetails.name}
              </Typography>
              <Typography variant="h6" sx={{ color: '#1a237e', mb: 3 }}>
                ₱{productDetails.buyPrice.toLocaleString()}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Product Code
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                    {productDetails.code}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                    {productDetails.category}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Seller
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                    {sellerUsername}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Stock
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                    {productDetails.qtyInStock}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: '#89343b',
            '&:hover': { bgcolor: '#6d2931' }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewProductAdmin;