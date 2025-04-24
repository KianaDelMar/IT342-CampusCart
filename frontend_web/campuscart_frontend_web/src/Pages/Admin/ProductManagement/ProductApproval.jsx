import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, Button, CircularProgress, Snackbar, Link,
  Breadcrumbs, Card, CardMedia, CardContent, Tooltip, Chip, TableSortLabel, TextField,
  FormControl, InputLabel, Select, MenuItem, Grid, Dialog, DialogActions, DialogContent, DialogTitle, Alert
} from '@mui/material';
import { Search as SearchIcon, CheckCircle, Cancel, AccessTime } from '@mui/icons-material';
import axios from 'axios';
import api from '../../../config/axiosConfig';
import ToastManager from '../../../components/ToastManager';

const columns = [
  { id: 'user', label: 'Username', minWidth: 170, sortable: true },
  { id: 'image', label: 'Image', minWidth: 120, sortable: false },
  { id: 'productName', label: 'Product Name', minWidth: 170, sortable: true },
  { id: 'productCode', label: 'Product Code', minWidth: 100, sortable: true },
  { id: 'category', label: 'Category', minWidth: 170, sortable: true },
  { id: 'status', label: 'Approval Status', minWidth: 170, sortable: false },
];

const createData = (productName, user, productCode, category, status, image) => {
  const formatStatus = (status) => {
    if (status === 'approved') return 'Approved';
    if (status === 'rejected') return 'Rejected';
    if (status === 'Pending') return 'Pending';
    if (status === 'Sold') return 'Sold';
    return status;
  };

  const imageUrl = image ? `http://localhost:8080/${image}` : null;

  return { productName, user, productCode, category, status: formatStatus(status), image: imageUrl };
};

const ProductApproval = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('user');
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await api.get('/product/pendingApproval');
        console.log("Products: ", response.data)
        const productData = response.data.map((product) =>
          createData(
            product.productName,
            product.userUsername,
            product.productCode,
            product.category,
            product.status,
            product.image
          )
        );
        setProducts(productData);
        updateSummary(productData);
      } catch (error) {
        setError('Error fetching products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleProductClick = (product) => {
    setSelectedProduct(product); 
    setOpenModal(true); 
  };

  const handleCloseModal = () => {
    setOpenModal(false); 
  };

  const handleApproveInModal = async () => {
    if (selectedProduct) {
      await handleApprove(selectedProduct.productCode);
      handleCloseModal(); // Close modal after approval
    }
  };

  const handleRejectInModal = async () => {
    if (selectedProduct) {
      await handleReject(selectedProduct.productCode);
      handleCloseModal(); // Close modal after rejection
    }
  };

  const updateSummary = (data) => {
    const approved = data.filter(p => p.status === 'Approved').length;
    const rejected = data.filter(p => p.status === 'Rejected').length;
    const pending = data.filter(p => p.status === 'Pending').length;
    const sold = data.filter(p => p.status === 'Sold').length;
    setSummary({ approved, rejected, pending, sold });
  };

  const handleApprove = async (productCode) => {
    try {
      const response = await api.post('/product/approve', { productCode });
      showToast('Product approved successfully!', 'success');

      setProducts((prevProducts) => {
        const updatedProducts = prevProducts.map(product =>
          product.productCode === productCode
            ? { ...product, status: 'Approved' }
            : product
        );
        updateSummary(updatedProducts);
        return updatedProducts;
      });
    } catch (error) {
      showToast('Error approving product', 'error');
    }
  };

  const handleReject = async (productCode) => {
    try {
      const response = await api.post('/product/reject', { productCode });
      showToast('Product rejected successfully!', 'success');

      setProducts((prevProducts) => {
        const updatedProducts = prevProducts.map(product =>
          product.productCode === productCode
            ? { ...product, status: 'Rejected' }
            : product
        );
        updateSummary(updatedProducts);
        return updatedProducts;
      });
    } catch (error) {
      showToast('Error rejecting product', 'error');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filterProducts = (products) => {
    if (!searchTerm && !statusFilter) return products;

    return products.filter((product) => {
      const productName = product.productName ? String(product.productName).toLowerCase() : '';
      const user = product.user ? String(product.user).toLowerCase() : '';
      const productCode = product.productCode ? String(product.productCode).toLowerCase() : '';
      const category = product.category ? String(product.category).toLowerCase() : '';
      const status = product.status ? String(product.status).toLowerCase() : '';

      const search = searchTerm.toLowerCase();
      const matchesSearch = (
        productName.includes(search) ||
        user.includes(search) ||
        productCode.includes(search) ||
        category.includes(search) ||
        status.includes(search)
      );
      const matchesStatus = statusFilter ? status.includes(statusFilter.toLowerCase()) : true;

      return matchesSearch && matchesStatus;
    });
  };

  const getStatusChipProps = (status) => {
    const props = {
      label: status === 'Blocked' || status === 'Block' ? 'Blocked' : status,
      sx: {
        width: '80px',
        height: '24px',
        color: 'white',
        fontWeight: 500,
        '& .MuiChip-label': {
          color: 'white',
          padding: 0,
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '15px',
          marginTop: '18px'
        }
      }
    };

    switch (status) {
      case 'Pending':
        return {
          ...props,
          sx: {
            ...props.sx,
            bgcolor: '#28a745',
            '&:hover': { bgcolor: '#28a745' }
          }
        };
        case 'Sold':
          return {
            ...props,
            sx: {
              ...props.sx,
              bgcolor: '#a9a9b0',
              '&:hover': { bgcolor: '#a9a9b0' }
            }
          };
      case 'Approved':
        return {
          ...props,
          sx: {
            ...props.sx,
            bgcolor: '#007bff',
            '&:hover': { bgcolor: '#007bff' }
          }
        };
      case 'Rejected':
        return {
          ...props,
          sx: {
            ...props.sx,
            bgcolor: '#dc3545',
            '&:hover': { bgcolor: '#dc3545' }
          }
        };
      default:
        return props;
    }
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortData = (data) => {
    const sortedData = [...data];
    sortedData.sort((a, b) => {
      const getStringValue = (value) => (value ? String(value) : "");

      if (orderBy === 'user') {
        return order === 'asc' ? getStringValue(a.user).localeCompare(getStringValue(b.user)) : getStringValue(b.user).localeCompare(getStringValue(a.user));
      }
      if (orderBy === 'productName') {
        return order === 'asc' ? getStringValue(a.productName).localeCompare(getStringValue(b.productName)) : getStringValue(b.productName).localeCompare(getStringValue(a.productName));
      }
      if (orderBy === 'productCode') {
        return order === 'asc' ? getStringValue(a.productCode).localeCompare(getStringValue(b.productCode)) : getStringValue(b.productCode).localeCompare(getStringValue(a.productCode));
      }
      if (orderBy === 'category') {
        return order === 'asc' ? getStringValue(a.category).localeCompare(getStringValue(b.category)) : getStringValue(b.category).localeCompare(getStringValue(a.category));
      }
      if (orderBy === 'status') {
        return order === 'asc' ? getStringValue(a.status).localeCompare(getStringValue(b.status)) : getStringValue(b.status).localeCompare(getStringValue(a.status));
      }
      return 0;
    });
    return sortedData;
  };

  const showToast = (message, severity = 'success') => {
    const newToast = {
      id: Date.now(),
      message,
      severity,
      open: true
    };
    setToasts(current => [newToast, ...current].slice(0, 2));
  };

  return (
    <Box sx={{ 
      padding: 3,
      backgroundColor: '#fff3e0', // Cream background color
      minHeight: '100vh'
    }}>
      <Typography variant="h4" sx={{ 
        color: '#89343b',
        mb: 3,
        fontWeight: 600,
        fontSize: '2rem'
      }}>
        Product Approval
      </Typography>

      {/* Filter Section */}
      <Box sx={{ 
        mb: 3,
        display: 'flex',
        gap: 2
      }}>
        {/* Search Input */}
        <TextField
          placeholder="Search..."
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{
            width: '300px',
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              borderRadius: 1,
              '& fieldset': {
                borderColor: '#e0e0e0',
              },
              '&:hover fieldset': {
                borderColor: '#89343b',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#89343b',
              },
            },
          }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: '#89343b', mr: 1 }} />,
          }}
        />

        {/* Approval Status Filter */}
        <FormControl size="small" sx={{ width: '200px' }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            displayEmpty
            sx={{
              backgroundColor: '#ffd700',
              borderRadius: 1,
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none'
              },
              '&:hover': {
                backgroundColor: '#ffd700',
              },
              '& .MuiSelect-select': {
                color: '#89343b',
                fontWeight: 500,
              }
            }}
          >
            <MenuItem value="">
              <em>All Status</em>
            </MenuItem>
            <MenuItem value="Approved">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle sx={{ mr: 1, color: '#28a745' }} />
                Approved
              </Box>
            </MenuItem>
            <MenuItem value="Rejected">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Cancel sx={{ mr: 1, color: '#dc3545' }} />
                Rejected
              </Box>
            </MenuItem>
            <MenuItem value="Pending">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTime sx={{ mr: 1, color: '#ffa000' }} />
                Pending
              </Box>
            </MenuItem>
            <MenuItem value="Sold">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle sx={{ mr: 1, color: '#757575' }} />
                Sold
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 2,
        mb: 3
      }}>
        <Card sx={{ 
          p: 2,
          bgcolor: '#fff9c4',
          borderRadius: 1,
          border: '1px solid #ffd700'
        }}>
          <Typography variant="h4" sx={{ color: '#89343b', fontWeight: 600 }}>{summary.pending}</Typography>
          <Typography variant="subtitle1" sx={{ color: '#89343b' }}>Pending</Typography>
        </Card>
        <Card sx={{ 
          p: 2,
          bgcolor: '#c8e6c9',
          borderRadius: 1,
          border: '1px solid #81c784'
        }}>
          <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 600 }}>{summary.approved}</Typography>
          <Typography variant="subtitle1" sx={{ color: '#2e7d32' }}>Approved</Typography>
        </Card>
        <Card sx={{ 
          p: 2,
          bgcolor: '#ffcdd2',
          borderRadius: 1,
          border: '1px solid #e57373'
        }}>
          <Typography variant="h4" sx={{ color: '#c62828', fontWeight: 600 }}>{summary.rejected}</Typography>
          <Typography variant="subtitle1" sx={{ color: '#c62828' }}>Rejected</Typography>
        </Card>
        <Card sx={{ 
          p: 2,
          bgcolor: '#e0e0e0',
          borderRadius: 1,
          border: '1px solid #bdbdbd'
        }}>
          <Typography variant="h4" sx={{ color: '#424242', fontWeight: 600 }}>{summary.sold}</Typography>
          <Typography variant="subtitle1" sx={{ color: '#424242' }}>Sold</Typography>
        </Card>
      </Box>

      {/* Product Table */}
      <TableContainer sx={{ 
        backgroundColor: 'white',
        borderRadius: 1,
        border: '1px solid #e0e0e0',
        maxHeight: 'calc(100vh - 280px)',
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px'
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1'
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#89343b',
          borderRadius: '4px'
        }
      }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align="left"
                  style={{ minWidth: column.minWidth }}
                  sx={{
                    bgcolor: '#fff3e0',
                    color: '#89343b',
                    fontWeight: 600,
                    borderBottom: '2px solid #89343b'
                  }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={(event) => handleRequestSort(event, column.id)}
                      sx={{
                        '&.Mui-active': {
                          color: '#89343b',
                          '& .MuiTableSortLabel-icon': {
                            color: '#89343b',
                          },
                        },
                      }}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              <TableCell 
                align="left" 
                sx={{ 
                  bgcolor: '#fff3e0',
                  color: '#89343b',
                  fontWeight: 600,
                  borderBottom: '2px solid #89343b'
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortData(filterProducts(products))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow 
                  hover 
                  role="checkbox"
                  tabIndex={-1}
                  key={index} 
                  onClick={() => handleProductClick(row)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { 
                      backgroundColor: '#fff8e1'
                    }
                  }}
                >
                  {columns.map((column) => {
                    const value = row[column.id];

                    if (column.id === 'image') {
                      return (
                        <TableCell key={column.id} align="left">
                          <Box sx={{ 
                            width: 50,
                            height: 50,
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: '1px solid #e0e0e0'
                          }}>
                            {row.image && (
                              <img 
                                src={row.image} 
                                alt={row.productName} 
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover' 
                                }} 
                              />
                            )}
                          </Box>
                        </TableCell>
                      );
                    }

                    if (column.id === 'status') {
                      return (
                        <TableCell key={column.id} align="left">
                          <Chip
                            label={value}
                            sx={{
                              bgcolor: 
                                value === 'Approved' ? '#28a745' :
                                value === 'Rejected' ? '#dc3545' :
                                value === 'Pending' ? '#ff9800' :
                                '#757575',
                              color: 'white',
                              fontWeight: 500,
                              minWidth: '90px'
                            }}
                          />
                        </TableCell>
                      );
                    }

                    return (
                      <TableCell key={column.id} align="left">
                        {value}
                      </TableCell>
                    );
                  })}
                  <TableCell align="left">
                    <Button
                      variant="outlined"
                      color="success"
                      startIcon={<CheckCircle />}
                      disabled={row.status === 'Approved' || row.status === 'Sold'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(row.productCode);
                      }}
                      sx={{
                        mr: 1,
                        borderRadius: 1,
                        textTransform: 'none',
                        '&:hover': {
                          bgcolor: '#66bb6a',
                          color: 'white'
                        }
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      disabled={row.status === 'Rejected' || row.status === 'Sold'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(row.productCode);
                      }}
                      sx={{
                        borderRadius: 1,
                        textTransform: 'none',
                        '&:hover': {
                          bgcolor: '#ef5350',
                          color: 'white'
                        }
                      }}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={products.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          bgcolor: '#fff3e0',
          borderTop: '1px solid #e0e0e0',
          '& .MuiTablePagination-select': {
            color: '#89343b'
          },
          '& .MuiTablePagination-selectIcon': {
            color: '#89343b'
          },
          '& .MuiTablePagination-displayedRows': {
            color: '#666'
          }
        }}
      />

      {/* Enhanced Product Details Modal */}
            <Dialog 
              open={openModal} 
              onClose={handleCloseModal}
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
                {selectedProduct && (
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
                        {selectedProduct.image ? (
                          <img 
                            src={selectedProduct.image} 
                            alt={selectedProduct.productName}
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
                        <Typography variant="h6" sx={{ color: '#1a237e', mb: 3 }}>
                          {selectedProduct.productName}
                        </Typography>
                        
                        <Grid container spacing={3}>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Product Code
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                              {selectedProduct.productCode}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Category
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                              {selectedProduct.category}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Seller
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                              {selectedProduct.user}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Status
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                              {selectedProduct.status}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </DialogContent>
              <DialogActions sx={{ 
                borderTop: '1px solid #e0e0e0',
                pt: 2,
                px: 3 
              }}>
                <Button 
                  onClick={handleCloseModal} 
                  variant="outlined"
                  sx={{ 
                    borderColor: '#89343b',
                    color: '#89343b',
                    '&:hover': {
                      borderColor: '#6d2931',
                      backgroundColor: 'rgba(137, 52, 59, 0.04)'
                    }
                  }}
                >
                  Close
                </Button>
                <Button 
                  onClick={handleApproveInModal}
                  variant="contained"
                  color="success"
                  sx={{ ml: 1 }}
                  disabled={selectedProduct?.status === 'Approved' || selectedProduct?.status === 'Sold'}
                >
                  Approve
                </Button>
                <Button 
                  onClick={handleRejectInModal}
                  variant="contained"
                  color="error"
                  sx={{ ml: 1 }}
                  disabled={selectedProduct?.status === 'Rejected' || selectedProduct?.status === 'Sold'}
                >
                  Reject
                </Button>
              </DialogActions>
            </Dialog>

      {/* Toast Messages */}
      <ToastManager toasts={toasts} handleClose={(id) => {
        setToasts(current => 
          current.map(toast => 
            toast.id === id ? { ...toast, open: false } : toast
          )
        );
      }} />
    </Box>
  );
};

export default ProductApproval;
