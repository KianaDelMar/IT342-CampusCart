import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CardMedia,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import homepage from '../../assets/img/homepage.jpg';

function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const loggedInUser = sessionStorage.getItem("username") || "User";
  const firstName = loggedInUser.split(" ")[0];

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = () => {
    navigate(`/buy?search=${searchQuery}`);
  };

  const handleCategoryClick = (category) => {
    const mappedCategory = category === "Stationery" ? "Stationery or Arts and Crafts" : category;
    navigate(`/buy?category=${mappedCategory}`);
  };

  const handleCardClick = (code) => {
    navigate(`/product/${code}`);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/product/getAllProducts/${loggedInUser}`);
        const approvedProducts = Array.isArray(response.data) 
          ? response.data.filter(product => product.status && product.status.toLowerCase() === 'approved')
          : [];
        setProducts(approvedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, [loggedInUser]);

  const sortedProducts = Array.isArray(products) 
    ? [...products]
      .reverse()
      .slice(0, 12)
    : [];

  return (
    <>
      <Box
        sx={{
          width: "auto",
          position: "relative",
          padding: { xs: "16px", sm: "240px", md: "120px" },
          borderRadius: "8px",
          mt: 4,
          mx: "4%",
          backgroundImage: `url(${homepage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          "&:before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1,
            borderRadius: "8px",
          },
          zIndex: 2,
        }}
      >
        <Typography
          variant="h2"
          align="center"
          sx={{
            fontWeight: "bold",
            mt: 2,
            zIndex: 2,
            marginBottom: 3,
            color: "white",
          }}
        >
          Welcome, {firstName}!
        </Typography>

        {/* Search Bar */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3, zIndex: 2 }}>
          <TextField
            variant="outlined"
            placeholder="What are you looking for?"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
            sx={{
              width: "700px",
              bgcolor: "white",
              borderRadius: "4px",
              border: "2px solid #ffd700",
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon
                    onClick={handleSearchSubmit}
                    style={{ cursor: "pointer" }}
                  />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Category Buttons */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mt: 2,
            overflowX: 'auto',
            width: '100%',
            pb: 2,
            mx: 'auto',
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 215, 0, 0.5)',
              borderRadius: '4px',
              '&:hover': {
                background: 'rgba(255, 215, 0, 0.7)',
              },
            },
            zIndex: 2,
          }}
          ref={(el) => {
            if (el) {
              el.addEventListener('wheel', (e) => {
                if (e.deltaY !== 0) {
                  e.preventDefault();
                  el.scrollLeft += e.deltaY;
                }
              }, { passive: false });
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              minWidth: 'min-content',
            }}
          >
            {[
              "Food",
              "Clothes",
              "Accessories",
              "Stationery",
              "Merchandise",
              "Supplies",
              "Electronics",
              "Beauty",
              "Books",
            ].map((category) => (
              <Button
                key={category}
                variant="outlined"
                onClick={() => handleCategoryClick(category)}
                sx={{
                  whiteSpace: 'nowrap',
                  fontWeight: "bold",
                  border: "2px solid #ffd700",
                  color: "#ffd700",
                  '&:hover': {
                    border: "2px solid #fff",
                    color: "#fff",
                    bgcolor: 'rgba(255, 215, 0, 0.1)',
                  },
                }}
              >
                {category}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Recently Listed Products */}
      <Box sx={{ mt: 4, mb: 3, px: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2, ml: 2 }}>
          Recently Listed
        </Typography>
        <Box
          sx={{
            display: 'flex',
            overflowX: 'auto',
            gap: 2,
            p: 2,
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(139, 0, 0, 0.5)',
              borderRadius: '4px',
              '&:hover': {
                background: 'rgba(139, 0, 0, 0.7)',
              },
            },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
          ref={(el) => {
            if (el) {
              // Add non-passive wheel event listener
              el.addEventListener('wheel', (e) => {
                if (e.deltaY !== 0) {
                  e.preventDefault();
                  el.scrollLeft += e.deltaY;
                }
              }, { passive: false });
            }
          }}
        >
          {Array.isArray(sortedProducts) && sortedProducts.length > 0 ? (
            sortedProducts
              .slice(0, 12)
              .map((product) => (
                <Box
                  key={product.code}
                  sx={{
                    flex: "0 0 auto",
                    width: "200px",
                    height: "300px",
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "0.3s",
                    "&:hover .overlay": {
                      opacity: 1,
                    },
                  }}
                  onClick={() => handleCardClick(product.code)}
                >
                  {/* Product Image */}
                  <CardMedia
                    component="img"
                    image={`http://localhost:8080/${product.imagePath}`}
                    alt={product.name}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {/* Hover Overlay */}
                  <Box
                    className="overlay"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      bgcolor: "rgba(0, 0, 0, 0.6)",
                      color: "white",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      opacity: 0,
                      transition: "opacity 0.3s ease-in-out",
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      {product.name}
                    </Typography>
                    <Typography variant="h6">PHP {product.buyPrice}</Typography>
                  </Box>
                </Box>
              ))
          ) : (
            <Typography variant="h6" sx={{ textAlign: "center", mt: 4, ml: 10 }}>
              No products to display.
            </Typography>
          )}
        </Box>

        {/* Footer Section */}
        <Box sx={{  padding: "20px", textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "#555" }}>
            © 2024 CIT-U Marketplace. All Rights Reserved.
          </Typography>
        </Box>
      </Box>
    </>
  );
}

export default HomePage;