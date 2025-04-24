import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, TextField, Checkbox, TableSortLabel, Menu, MenuItem, FormControl,
  InputLabel, Select, Chip, Snackbar, Alert, Breadcrumbs, Link, Typography, 
  Button, IconButton, TablePagination, Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import {
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  FileDownload as FileDownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
//import UpdateProductModal from './UpdateProductModal';
import ViewProductAdmin from './ViewProductAdmin';
import ToastManager from '../../../components/ToastManager';
import api from '../../../config/axiosConfig';


const ProductSellers = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderBy, setOrderBy] = useState('code');
  const [order, setOrder] = useState('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    stockRange: { min: '', max: '' },
    priceRange: { min: '', max: '' }
  });
  const [toasts, setToasts] = useState([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/admin/products-with-sellers');
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (err) {
        console.error('Failed to fetch product data:', err);
      }
    };

    fetchProducts();
  }, []);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    setOrder(newOrder);
    setOrderBy(property);

    const sortedProducts = [...filteredProducts].sort((a, b) => {
      let aValue, bValue;
      
      // Handle specific properties
      if (property === 'stock') {
        aValue = Number(a.product.qtyInStock);
        bValue = Number(b.product.qtyInStock);
      } else if (property === 'price') {
        aValue = Number(a.product.buyPrice);
        bValue = Number(b.product.buyPrice);
      } else {
        aValue = a.product[property];
        bValue = b.product[property];
      }

      // String comparison for text fields
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      return newOrder === 'asc' 
        ? (aValue < bValue ? -1 : 1)
        : (aValue > bValue ? -1 : 1);
    });

    setFilteredProducts(sortedProducts);
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    let filtered = [...products];
    if (query) {
      filtered = filtered.filter(item => {
        const words = item.product.name.split(' ');
        return words.some(word => word.toLowerCase().startsWith(query)) ||
               item.sellerUsername.toLowerCase().includes(query);
      });
    }
    
    setFilteredProducts(filtered);
  };

  const applyFilters = (query = searchQuery, currentFilters = filters) => {
    let filtered = [...products];

    // Search filter
    if (query) {
      filtered = filtered.filter(item => 
        item.product.code.toString().toLowerCase().includes(query.toLowerCase()) ||
        item.product.name.toLowerCase().includes(query.toLowerCase()) ||
        item.sellerUsername.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Category filter
    if (currentFilters?.category) {
      filtered = filtered.filter(item => 
        item.product.category === currentFilters.category
      );
    }

    // Stock range filter
    if (currentFilters?.stockRange?.min !== '' && currentFilters?.stockRange?.min !== null) {
      filtered = filtered.filter(item => 
        item.product.qtyInStock >= Number(currentFilters.stockRange.min)
      );
    }
    if (currentFilters?.stockRange?.max !== '' && currentFilters?.stockRange?.max !== null) {
      filtered = filtered.filter(item => 
        item.product.qtyInStock <= Number(currentFilters.stockRange.max)
      );
    }

    // Price range filter
    if (currentFilters?.priceRange?.min !== '' && currentFilters?.priceRange?.min !== null) {
      filtered = filtered.filter(item => 
        item.product.buyPrice >= Number(currentFilters.priceRange.min)
      );
    }
    if (currentFilters?.priceRange?.max !== '' && currentFilters?.priceRange?.max !== null) {
      filtered = filtered.filter(item => 
        item.product.buyPrice <= Number(currentFilters.priceRange.max)
      );
    }

    setFilteredProducts(filtered);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allCodes = filteredProducts
        .filter(item => item?.product?.code)
        .map(item => item.product.code);
      setSelectedProducts(allCodes);
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectOne = (event, product) => {
    if (!product?.product?.code) return;
    
    const productCode = product.product.code;
    setSelectedProducts(prev => 
      event.target.checked
        ? [...prev, productCode]
        : prev.filter(code => code !== productCode)
    );
  };

  const handleBulkDelete = async () => {
    try {
      // Send the array of product codes to delete
      await api.delete('/admin/delete-products', {
        data: selectedProducts // This sends the array of product codes in the request body
      });

      // Update the local state after successful deletion
      const remainingProducts = products.filter(item => 
        !selectedProducts.includes(item.product.code)
      );
      setProducts(remainingProducts);
      setFilteredProducts(remainingProducts);
      setSelectedProducts([]);
      
      showToast(`${selectedProducts.length} products have been deleted`, 'success');
    } catch (error) {
      console.error('Failed to delete products:', error);
      showToast(error.response?.data?.message || 'Failed to delete products', 'error');
    }
  };

  const handleProductAction = async (action, product) => {
    switch (action) {
      case 'edit':
        setSelectedProduct(product);
        setUpdateModalOpen(true);
        break;
      case 'delete':
        try {
          await api.delete(`/admin/deleteproducts/${product.product.code}`);
          const updatedProducts = products.filter(p => p.product.code !== product.product.code);
          setProducts(updatedProducts);
          setFilteredProducts(updatedProducts);
          showToast(`Product ${product.product.name} has been deleted`, 'success');
        } catch (error) {
          console.error('Failed to delete product:', error);
          showToast(error.response?.data?.message || 'Failed to delete product', 'error');
        }
        break;
      default:
        break;
    }
    setActionAnchorEl(null);
  };

  const handleAddProduct = async (formData) => {
    try {
      const response = await api.post(
        '/admin/postproduct',
        formData,
        {
          headers: {
            'Content-Type': undefined,
            'Accept': 'application/json'
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        // Refresh the products list after adding
        const productsResponse = await api.get('/admin/products-with-sellers');
        const newProducts = productsResponse.data;
        
        // Make sure we have valid data before updating state
        if (Array.isArray(newProducts) && newProducts.every(item => item?.product?.code)) {
          setProducts(newProducts);
          setFilteredProducts(newProducts);
          
          showToast('Product added successfully', 'success');
          
          setAddModalOpen(false);
        }
      }
    } catch (error) {
      console.error('Error adding product:', error);
      showToast(error.response?.data?.message || 'Failed to add product', 'error');
    }
  };

  const handleEditProduct = async (updatedProducts) => {
    try {
      // Update state with the fresh data
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
      setUpdateModalOpen(false);
      setSelectedProduct(null);
      
      showToast('Product updated successfully', 'success');
    } catch (error) {
      console.error('Error updating product data:', error);
      showToast(error.response?.data?.message || 'Error updating product data. Please try again.', 'error');
    }
  };

  const handleDeleteProducts = async (productsToDelete) => {
    try {
      const productCodes = Array.isArray(productsToDelete) 
        ? productsToDelete.map(p => p.product.code)
        : [productsToDelete.product.code];

      // Delete each product one by one
      await Promise.all(
        productCodes.map(code => 
          api.delete(`/admin/deleteproducts/${code}`)
        )
      );

      const updatedProducts = products.filter(p => 
        !productCodes.includes(p.product.code)
      );
      
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
      setSelectedProducts([]);
      showToast(`${productCodes.length > 1 ? 'Products' : 'Product'} deleted successfully`, 'success');
    } catch (error) {
      console.error('Failed to delete products:', error);
      showToast('Failed to delete products', 'error');
    }
  };

  const handleRowClick = (event, item) => {
    // Check if click originated from the actions or checkbox column
    if (event.target.closest('.actions-column') || event.target.closest('.select-column')) {
      return;
    }
    setSelectedProduct(item);
    setViewModalOpen(true);
  };

  const FilterMenu = () => {
    const [tempFilters, setTempFilters] = useState(filters);

    const handleApply = () => {
      setFilters(tempFilters);
      applyFilters(searchQuery, tempFilters);
      setFilterAnchorEl(null);
    };

    const handleReset = () => {
      const resetFilters = {
        category: '',
        stockRange: { min: '', max: '' },
        priceRange: { min: '', max: '' }
      };
      setTempFilters(resetFilters);
      setFilters(resetFilters);
      applyFilters(searchQuery, resetFilters);
      setFilterAnchorEl(null);
    };

    return (
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
        PaperProps={{
          sx: { width: 250, mt: 1 }
        }}
      >
        <MenuItem sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <FormControl fullWidth size="small" sx={{ mb: 1 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={tempFilters.category}
              label="Category"
              onChange={(e) => setTempFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Electronics">Electronics</MenuItem>
              <MenuItem value="Accessories">Accessories</MenuItem>
              <MenuItem value="Clothing">Clothing</MenuItem>
              <MenuItem value="Books">Books</MenuItem>
            </Select>
          </FormControl>
          
          <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>Stock Range</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              type="number"
              label="Min"
              value={tempFilters.stockRange?.min}
              onChange={(e) => setTempFilters(prev => ({
                ...prev,
                stockRange: { ...prev.stockRange, min: e.target.value }
              }))}
            />
            <TextField
              size="small"
              type="number"
              label="Max"
              value={tempFilters.stockRange?.max}
              onChange={(e) => setTempFilters(prev => ({
                ...prev,
                stockRange: { ...prev.stockRange, max: e.target.value }
              }))}
            />
          </Box>

          <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>Price Range</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              type="number"
              label="Min"
              value={tempFilters.priceRange?.min}
              onChange={(e) => setTempFilters(prev => ({
                ...prev,
                priceRange: { ...prev.priceRange, min: e.target.value }
              }))}
            />
            <TextField
              size="small"
              type="number"
              label="Max"
              value={tempFilters.priceRange?.max}
              onChange={(e) => setTempFilters(prev => ({
                ...prev,
                priceRange: { ...prev.priceRange, max: e.target.value }
              }))}
            />
          </Box>
        </MenuItem>
        <MenuItem sx={{ gap: 1, justifyContent: 'flex-end', pt: 2 }}>
          <Button 
            variant="outlined"
            onClick={handleReset}
            sx={{ 
              borderColor: '#89343b',
              color: '#89343b',
              '&:hover': {
                borderColor: '#6d2931',
                backgroundColor: 'rgba(137, 52, 59, 0.04)'
              }
            }}
          >
            Reset
          </Button>
          <Button 
            variant="contained"
            onClick={handleApply}
            sx={{ 
              bgcolor: '#89343b',
              '&:hover': { bgcolor: '#6d2931' }
            }}
          >
            Apply
          </Button>
        </MenuItem>
      </Menu>
    );
  };

  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const showToast = (message, severity = 'success') => {
    const newToast = {
      id: Date.now(),
      message,
      severity,
      open: true
    };
    
    setToasts(current => [newToast, ...current].slice(0, 2));
  };

  const handleClose = (id) => {
    setToasts(current => 
      current.map(toast => 
        toast.id === id ? { ...toast, open: false } : toast
      )
    );
  };

  if (!products.length) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#89343b' }}>
          Product Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {selectedProducts.length > 0 && (
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon sx={{ color: 'white' }} />}
              onClick={handleBulkDelete}
              sx={{ 
                '& .MuiButton-startIcon': {
                  margin: 0,
                  marginRight: '8px',
                  display: 'flex',
                  alignItems: 'center'
                }
              }}
            >
              Delete Selected ({selectedProducts.length})
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          placeholder="Search products..."
          size="small"
          value={searchQuery}
          onChange={handleSearch}
          sx={{ 
            flexGrow: 1,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              '& fieldset': {
                borderColor: 'transparent'
              },
              '&:hover fieldset': {
                borderColor: 'transparent'
              },
              '&.Mui-focused fieldset': {
                borderColor: 'transparent'
              }
            }
          }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
          }}
        />

        <Button
          variant="contained"
          startIcon={<FilterListIcon />}
          onClick={(e) => setFilterAnchorEl(e.currentTarget)}
          sx={{ 
            bgcolor: '#ffd700',
            color: 'black',
            '&:hover': {
              bgcolor: '#ffcd00'
            },
            '& .MuiButton-startIcon': {
              margin: 0,
              marginRight: '8px',
              display: 'flex',
              alignItems: 'center'
            }
          }}
        >
          Filters
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ mt: 3, height: 'calc(100vh - 250px)' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ 
              '& th': { 
                bgcolor: '#f5f5f5', 
                fontWeight: 'bold',
                fontSize: '0.875rem',
                color: 'rgba(0, 0, 0, 0.87)',
                '& .MuiTableSortLabel-root': {
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  '&.Mui-active': {
                    color: '#89343b',
                  },
                },
                '& .MuiTableSortLabel-icon': {
                  opacity: 1,
                }
              } 
            }}>
              <TableCell padding="checkbox" className="select-column">
                <Checkbox
                  indeterminate={selectedProducts.length > 0 && selectedProducts.length < filteredProducts.length}
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'code'}
                  direction={orderBy === 'code' ? order : 'asc'}
                  onClick={() => handleSort('code')}
                >
                  Code
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Product Name
                </TableSortLabel>
              </TableCell>
              <TableCell>Description</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'stock'}
                  direction={orderBy === 'stock' ? order : 'asc'}
                  onClick={() => handleSort('stock')}
                >
                  Stock
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'price'}
                  direction={orderBy === 'price' ? order : 'asc'}
                  onClick={() => handleSort('price')}
                >
                  Price
                </TableSortLabel>
              </TableCell>
              <TableCell>Category</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'seller'}
                  direction={orderBy === 'seller' ? order : 'asc'}
                  onClick={() => handleSort('seller')}
                  sx={{ display: 'flex !important' }}
                >
                  Seller
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProducts.map((item, index) => (
              <TableRow 
                key={index}
                onClick={(e) => handleRowClick(e, item)}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { 
                    backgroundColor: '#fafafa',
                    transition: 'background-color 0.2s ease'
                  }
                }}
              >
                <TableCell padding="checkbox" className="select-column">
                  <Checkbox
                    checked={selectedProducts.includes(item.product.code)}
                    onChange={(e) => handleSelectOne(e, item)}
                  />
                </TableCell>
                <TableCell sx={{ py: 1 }}>{item.product.code}</TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <img 
                      src={`http://localhost:8080/${item.product.imagePath}`}
                      alt={item.product.name}
                      style={{ width: 50, height: 50, objectFit: 'cover' }}
                    />
                    {item.product.name}
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 1 }}>{item.product.pdtDescription}</TableCell>
                <TableCell sx={{ py: 1 }}>{item.product.qtyInStock}</TableCell>
                <TableCell sx={{ py: 1 }}>₱{item.product.buyPrice}</TableCell>
                <TableCell sx={{ py: 1 }}>{item.product.category}</TableCell>
                <TableCell sx={{ py: 1 }}>{item.sellerUsername}</TableCell>
                <TableCell className="actions-column">
                  <IconButton 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click
                      setSelectedProduct(item);
                      setActionAnchorEl(e.currentTarget);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredProducts.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 25, 50]}
        sx={{
          backgroundColor: '#f4f4f4',
          borderTop: '2px solid #ddd',
          '& .MuiTablePagination-selectIcon': { color: '#555' },
          '& .MuiTablePagination-caption': { color: '#555' },
          '& .MuiTablePagination-toolbar': {
            justifyContent: 'flex-end',
          },
          '& .MuiTablePagination-actions': {
            marginLeft: 0,
          },
        }}
      />

      <FilterMenu />

      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={() => setActionAnchorEl(null)}
      >
        <MenuItem onClick={() => handleProductAction('edit', selectedProduct)}>
          <EditIcon sx={{ mr: 1 }} /> Edit Product
        </MenuItem>
        <MenuItem 
          onClick={() => handleProductAction('delete', selectedProduct)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} /> Delete Product
        </MenuItem>
      </Menu>

      {/*
      <UpdateProductModal
        open={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        product={selectedProduct?.product}
        onSave={handleEditProduct}
      />
      */}

      <ViewProductAdmin
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        product={selectedProduct}
      />

      <ToastManager toasts={toasts} handleClose={handleClose} />
    </Box>
  );
};

const styles = {
  container: {
    padding: '24px',
    backgroundColor: 'transparent',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    fontFamily: "'Inter', sans-serif",
    color: '#333',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    color: '#8B4513',
    fontSize: '28px',
    fontWeight: 'bold',
  },
  actionButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px',
    color: '#555',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 0',
  },
  select: {
    padding: '8px',
    borderRadius: '8px',
    border: '1px solid #ddd',
  },
  paginationButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#007bff',
    fontWeight: 'bold',
  },
  loading: {
    textAlign: 'center',
    color: '#555',
    padding: '20px',
  },
  error: {
    textAlign: 'center',
    color: '#d9534f',
    padding: '20px',
  },
};

export default ProductSellers;
