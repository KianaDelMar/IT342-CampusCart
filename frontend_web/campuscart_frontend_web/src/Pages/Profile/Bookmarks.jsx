import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Box, InputBase, Button, Typography, Grid, Card, CardMedia, CardContent, Avatar } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteIcon from '@mui/icons-material/Favorite';
import axios from 'axios';

const Bookmarks = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [likedProducts, setLikedProducts] = useState([]);
  const loggedInUser = sessionStorage.getItem('username');

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  const handleCardClick = (code) => {
    console.log('Navigating to product:', code);
    navigate(`/product/${code}`);
  };

  useEffect(() => {
    const handleLikesUpdated = async () => {
      const likedProductIds = JSON.parse(localStorage.getItem('likedProducts')) || [];

      try {
        const response = await axios.get(`http://localhost:8080/api/product/getAllProducts/${loggedInUser}`);
        const allProducts = response.data;

        const liked = allProducts.filter((product) => likedProductIds.includes(product.code));
        setLikedProducts(liked);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    window.addEventListener('likesUpdated', handleLikesUpdated);
    handleLikesUpdated();

    return () => {
      window.removeEventListener('likesUpdated', handleLikesUpdated);
    };
  }, [loggedInUser]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", padding: "20px", overflowX: 'hidden' }}>

      <Box sx={{
        height: "300px",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "8px",
        marginBottom: "20px",
        overflow: "hidden",
      }}>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url('/images/homepage.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: -2,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: -1, 
          }}
        />
        <Typography variant="h3" sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
          Discover Your Favorite Products
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box sx={{ display: "flex", justifyContent: "center", marginBottom: "30px" }}>
        <Box sx={{ display: "flex", alignItems: "center", width: "80%", padding: "10px", backgroundColor: "white", borderRadius: "30px", boxShadow: 3 }}>
          <SearchIcon sx={{ color: "#8B8B8B", marginRight: "10px" }} />
          <InputBase
            placeholder="Search for an item"
            value={query}
            onChange={handleInputChange}
            sx={{ flex: 1, fontSize: "16px" }}
          />
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#89343b",
              color: "white",
              borderRadius: "30px",
              fontWeight: "bold",
              padding: "8px 20px",
              '&:hover': {
                backgroundColor: "#b24d57",
              },
            }}
          >
            Search
          </Button>
        </Box>
      </Box>

      {/* Featured Section */}
      <Box sx={{ marginBottom: "40px", textAlign: "center" }}>
        <Typography variant="h4" sx={{ color: "#333", fontWeight: 600, marginBottom: "10px" }}>
          Featured Liked Products
        </Typography>
        <Typography variant="body1" sx={{ color: "#555", marginBottom: "20px" }}>
          Here are some of the most popular products that you might like.
        </Typography>

        <Grid container spacing={2}>
        {likedProducts.map((product) => (
          <Grid item xs={2.4} key={product.code}>
            <Card
              onClick={() => handleCardClick(product.code)}
              sx={{
                width: '100%',
                marginLeft: '30px',
                marginTop: '20px',
                backgroundColor: 'white',
                boxShadow: 'none',
                transition: '0.3s',
                '&:hover': {
                  boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', margin: '5px', color: 'gray', padding: '10px' }}>
                <Avatar src={`http://localhost:8080/${product.sellerProfileImage}`} />
                <Box sx={{ ml: 1 }}>
                  <Typography variant="subtitle1" color="black" sx={{ lineHeight: 1, mb: 0, fontWeight: 500 }}>
                    {product.sellerUsername}
                  </Typography>
                  <Typography variant="subtitle2" color="gray" sx={{ mt: 0, fontSize: '12px' }}>
                    2 months ago
                  </Typography>
                </Box>
              </Box>
              <CardMedia
                component="img"
                height="140"
                image={`http://localhost:8080/${product.imagePath}`}
                alt={product.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/140';
                }}
              />
              <CardContent>
                <Typography color="black" noWrap>
                  {product.name}
                </Typography>
                <Typography variant="h6" noWrap sx={{ mt: 0, fontWeight: 'bold' }}>
                  PHP {product.buyPrice.toFixed(2)}
                </Typography>
                <Typography variant="body1">{product.conditionType}</Typography>
                <FavoriteIcon sx={{ color: 'red' }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      </Box>

      {/* Footer Section */}
      <Box sx={{  padding: "20px", textAlign: "center" }}>
        <Typography variant="body2" sx={{ color: "#555" }}>
          © 2024 CIT-U Marketplace. All Rights Reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Bookmarks;
