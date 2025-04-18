import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Card, CardContent, CardMedia, Avatar, FormControl, InputLabel, Select, MenuItem, InputBase, IconButton, Menu, Button, Skeleton, Container } from '@mui/material';
import { Search as SearchIcon, FilterList as FilterListIcon, Clear as ClearIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled } from '@mui/system';
import api from '../../config/axiosConfig';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: '4px',
    backgroundColor: '#f5f5f5',
    '&:hover': {
        backgroundColor: '#eeeeee',
    },
    marginLeft: 0,
    width: '100%',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
}));

const SearchIconWrapper = styled('div')({
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#89343b',
});

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    paddingRight: theme.spacing(2),
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        fontSize: '0.9rem',
    },
}));

const FilterButton = styled(IconButton)({
    marginLeft: '8px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    padding: '8px',
    '&:hover': {
        backgroundColor: '#eeeeee',
    },
});

const BrowsePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search') || '';
    const categoryQuery = searchParams.get('category') || '';
    const [imageError, setImageError] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(searchQuery);
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [filterPosition, setFilterPosition] = useState(null);
    const [filters, setFilters] = useState({
        category: categoryQuery,
        status: '',
        conditionType: '',
    });
    const [tempFilters, setTempFilters] = useState({
        category: categoryQuery,
        status: '',
        conditionType: '',
    });

    const loggedInUser = sessionStorage.getItem('username');

    const handleCardClick = (code) => {
        navigate(`product/${code}`);
    };

    const handleFilterClick = (event) => {
        setFilterAnchorEl(event.currentTarget);
        setFilterPosition({
            top: event.currentTarget.getBoundingClientRect().bottom,
            left: event.currentTarget.getBoundingClientRect().left,
        });
    };

    const handleFilterClose = () => {
        setFilterAnchorEl(null);
    };

    const handleFilterChange = (key, value) => {
        setTempFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
    };

    const handleSearchChange = (event) => {
        const searchValue = event.target.value;
        setSearchTerm(searchValue);

        if (searchValue === '') {
            setFilters({
                category: '',
                status: '',
                conditionType: '',
            });
            setFilteredProducts(allProducts);
        }
    };

    const handleApplyFilters = () => {
        setFilters(tempFilters);

        const params = new URLSearchParams();
        if (tempFilters.category) params.set('category', tempFilters.category);
        if (tempFilters.status) params.set('status', tempFilters.status);
        if (tempFilters.conditionType) params.set('condition', tempFilters.conditionType);
        if (searchTerm) params.set('search', searchTerm);

        navigate({
            pathname: location.pathname,
            search: params.toString()
        });

        handleFilterClose();
    };

    const handleClearFilters = () => {
        const emptyFilters = {
            category: '',
            status: '',
            conditionType: '',
        };
        setFilters(emptyFilters);
        setTempFilters(emptyFilters);
        setFilteredProducts(allProducts);

        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);

        navigate({
            pathname: location.pathname,
            search: params.toString()
        });
    };

    useEffect(() => {
        const fetchAllProducts = async () => {
            setLoading(true);

            try {
                const response = await api.get(`/product/getAllProducts/${loggedInUser}`);
                console.log('Products', response.data);
                if (response.status === 200) {
                    const approvedProducts = response.data.filter(product => product.status && product.status.toLowerCase() === 'approved');
                    console.log('Products with profile photos:', approvedProducts.map(p => ({
                        username: p.userUsername,
                        photo: p.userProfileImagePath
                      })));
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
        const fetchFilteredProducts = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `http://localhost:8080/api/product/getAllProductsFilter/${loggedInUser}`,
                    {
                        params: {
                            username: loggedInUser,
                            category: filters.category,
                            status: filters.status,
                            conditionType: filters.conditionType,
                        },
                    }
                );
                setFilteredProducts(response.data);
            } catch (error) {
                console.error("Error fetching filtered products:", error);
            } finally {
                setLoading(false);
            }
        };

        if (filters.category || filters.status || filters.conditionType) {
            fetchFilteredProducts();
        } else {
            setFilteredProducts(allProducts);
        }
    }, [filters, loggedInUser, allProducts]);

    useEffect(() => {
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            const searchedProducts = allProducts.filter((product) =>
                product.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                product.name.toLowerCase().split(' ').some(word =>
                    word.startsWith(lowerCaseSearchTerm)
                )
            );
            setFilteredProducts(searchedProducts);
        } else {
            setFilteredProducts(prevFilteredProducts =>
                filters.category || filters.status || filters.conditionType
                    ? prevFilteredProducts
                    : allProducts
            );
        }
    }, [searchTerm, allProducts, filters]);

    if (loading) return <div>Loading...</div>;

    return (
        <Container maxWidth="xl" sx={{ 
            py: 3,
            px: { xs: 2, sm: 3, md: 4 },
            maxWidth: '1800px !important',
        }}>
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: 2,
                mb: 4,
            }}>
                <Box sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                }}>
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search products..."
                            inputProps={{ 'aria-label': 'search' }}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            autoFocus
                        />
                        {searchTerm && (
                            <IconButton
                                size="small"
                                onClick={() => setSearchTerm('')}
                                sx={{ mr: 1 }}
                            >
                                <ClearIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Search>

                    <FilterButton onClick={handleFilterClick}>
                        <FilterListIcon sx={{ color: '#89343b' }} />
                    </FilterButton>
                </Box>
            </Box>

            <Menu
                anchorReference="anchorPosition"
                anchorPosition={filterPosition}
                open={Boolean(filterAnchorEl)}
                onClose={handleFilterClose}
                sx={{
                    '& .MuiPaper-root': {
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
                        padding: '16px',
                        width: '320px',
                    },
                }}
            >
                <Box sx={{ padding: 2 }}>
                    <FormControl fullWidth sx={{ marginBottom: 2 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={tempFilters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            label="Category"
                            sx={{
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#e0e0e0',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#89343b',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#89343b',
                                },
                            }}
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="Food">Food</MenuItem>
                            <MenuItem value="Clothes">Clothes</MenuItem>
                            <MenuItem value="Accessories">Accessories</MenuItem>
                            <MenuItem value="Stationery or Arts and Crafts">Stationery / Arts and Crafts</MenuItem>
                            <MenuItem value="Merchandise">Merchandise</MenuItem>
                            <MenuItem value="Supplies">Supplies</MenuItem>
                            <MenuItem value="Electronics">Electronics</MenuItem>
                            <MenuItem value="Beauty">Beauty</MenuItem>
                            <MenuItem value="Books">Books</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ marginBottom: 2 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={tempFilters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            label="Status"
                            sx={{
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#e0e0e0',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#89343b',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#89343b',
                                },
                            }}
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="Available">Available</MenuItem>
                            <MenuItem value="Sold">Sold</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ marginBottom: 2 }}>
                        <InputLabel>Condition</InputLabel>
                        <Select
                            value={tempFilters.conditionType}
                            onChange={(e) => handleFilterChange('conditionType', e.target.value)}
                            label="Condition"
                            sx={{
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#e0e0e0',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#89343b',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#89343b',
                                },
                            }}
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="Brand New">Brand New</MenuItem>
                            <MenuItem value="Pre-Loved">Pre-Loved</MenuItem>
                            <MenuItem value="None">None</MenuItem>
                        </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            onClick={handleClearFilters}
                            variant="outlined"
                            sx={{
                                width: '50%',
                                borderColor: '#89343b',
                                color: '#89343b',
                                '&:hover': {
                                    borderColor: '#6b2831',
                                    backgroundColor: 'rgba(137, 52, 59, 0.04)',
                                }
                            }}
                        >
                            Clear
                        </Button>
                        <Button
                            onClick={handleApplyFilters}
                            variant="contained"
                            sx={{
                                width: '50%',
                                bgcolor: '#89343b',
                                '&:hover': {
                                    bgcolor: '#6b2831'
                                }
                            }}
                        >
                            Apply
                        </Button>
                    </Box>
                </Box>
            </Menu>

            {loading ? (
                <Grid container spacing={3}>
                    {[...Array(8)].map((_, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={4} key={index}>
                            <Card sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: 'none',
                                border: '1px solid rgba(255, 0, 0, 0.08)',
                                borderRadius: '8px',
                            }}>
                                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '8px 8px 0 0' }} />
                                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                    <Skeleton variant="text" width="80%" height={24} />
                                    <Skeleton variant="text" width="60%" height={20} />
                                    <Skeleton variant="text" width="40%" height={20} />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Grid container spacing={3}>
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <Grid item xs={12} sm={6} md={4} lg={4} key={product.code}>
                                <Card
                                    onClick={() => handleCardClick(product.code)}
                                    sx={{
                                        width: '100%',
                                        height: '400px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                                        border: '1px solid rgba(0, 0, 0, 0.08)',
                                        borderRadius: '12px',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer',
                                        backgroundColor: 'white',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                                        },
                                    }}
                                >
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        p: 2,
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                                        height: '60px',
                                    }}>
                                        <Avatar
                                            src={!imageError && product.userProfileImagePath ?
                                                `http://localhost:8080/uploads/${product.userProfileImagePath}` :
                                                `https://ui-avatars.com/api/?name=${product.userUsername}&background=89343b&color=fff`
                                            }
                                            alt={product.userUsername}
                                            onError={() => setImageError(true)}
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                bgcolor: '#89343b',
                                                '& .MuiAvatar-img': {
                                                    objectFit: 'cover'
                                                }
                                            }}
                                        />
                                        <Box sx={{ ml: 1.5 }}>
                                            <Typography variant="subtitle2" sx={{
                                                fontWeight: 600,
                                                color: '#2C3E50',
                                                lineHeight: 1.2,
                                                fontSize: '0.875rem',
                                                '&:hover': {
                                                    color: '#89343b',
                                                }
                                            }}>
                                                {product.userUsername}
                                            </Typography>
                                            <Typography variant="caption" sx={{
                                                color: '#666',
                                                fontSize: '0.75rem',
                                            }}>
                                                2 months ago
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{
                                        position: 'relative',
                                        height: '220px',
                                        overflow: 'hidden',
                                        backgroundColor: '#f8f8f8',
                                    }}>
                                        <CardMedia
                                            component="img"
                                            image={`http://localhost:8080/${product.imagePath}`}
                                            alt={product.name}
                                            sx={{
                                                height: '100%',
                                                width: '100%',
                                                objectFit: 'cover',
                                                transition: 'transform 0.3s ease',
                                                '&:hover': {
                                                    transform: 'scale(1.05)',
                                                },
                                            }}
                                        />
                                    </Box>

                                    <CardContent sx={{ 
                                        p: 2,
                                        height: '140px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 600,
                                            color: '#2C3E50',
                                            fontSize: '1rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            lineHeight: 1.4,
                                            mb: 1.5
                                        }}>
                                            {product.name}
                                        </Typography>

                                        <Typography variant="h6" sx={{
                                            color: '#2C3E50',
                                            fontWeight: 500,
                                            fontSize: '0.95rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            lineHeight: 1.4,
                                            mb: 1.5
                                        }}>
                                            {product.pdtDescription}
                                        </Typography>

                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mt: 'auto',
                                            pt: 1.5,
                                            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                                            gap: 2
                                        }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography 
                                                    variant="h6" 
                                                    sx={{
                                                        color: '#89343b',
                                                        fontWeight: 700,
                                                        fontSize: '1.1rem',
                                                        display: 'inline-block',
                                                        mr: 1.5
                                                    }}
                                                >
                                                    PHP {product.buyPrice.toFixed(2)}
                                                </Typography>
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{
                                                        color: '#666',
                                                        fontWeight: 500,
                                                        display: 'inline-block'
                                                    }}
                                                >
                                                    {product.conditionType}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Box sx={{
                            width: '100%',
                            textAlign: 'center',
                            py: 6,
                            color: '#666',
                        }}>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                No products found
                            </Typography>
                            <Typography variant="body2">
                                Try adjusting your search or filters
                            </Typography>
                        </Box>
                    )}
                </Grid>
            )}

            <Box sx={{
                py: 3,
                textAlign: "center",
                mt: 4,
                borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            }}>
                <Typography variant="body2" sx={{ color: "#666" }}>
                    © 2024 CIT-U Marketplace. All Rights Reserved.
                </Typography>
            </Box>
        </Container>
    );
};

export default BrowsePage;