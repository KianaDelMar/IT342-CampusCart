import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Card, 
  CardContent,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  People as PeopleIcon,
  Inventory as InventoryIcon,
  PendingActions as PendingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import axios from 'axios';
import api from '../../config/axiosConfig';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      
    },
    recentProducts: [], 
    recentlySold: [
      {
        productCode: 'PRD001',
        productName: 'Gaming Laptop',
        userUsername: 'juan_dela_cruz',
        buyerUsername: 'maria_santos',
        category: 'Electronics',
        price: 75000,
        soldDate: '2024-03-20',
        imagePath: 'https://picsum.photos/200/300'
      },
      {
        productCode: 'PRD006',
        productName: 'Wireless Mouse',
        userUsername: 'pedro_reyes',
        buyerUsername: 'rosa_cruz',
        category: 'Accessories',
        price: 1200,
        soldDate: '2024-03-19',
        imagePath: 'https://picsum.photos/200/305'
      },
      {
        productCode: 'PRD008',
        productName: 'Headphones',
        userUsername: 'maria_santos',
        buyerUsername: 'juan_dela_cruz',
        category: 'Electronics',
        price: 3500,
        soldDate: '2024-03-18',
        imagePath: 'https://picsum.photos/200/306'
      },
      {
        productCode: 'PRD002',
        productName: 'Mechanical Keyboard',
        userUsername: 'carlo_garcia',
        buyerUsername: 'pedro_reyes',
        category: 'Accessories',
        price: 5500,
        soldDate: '2024-03-17',
        imagePath: 'https://picsum.photos/200/301'
      },
      {
        productCode: 'PRD007',
        productName: 'Gaming Chair',
        userUsername: 'rosa_cruz',
        buyerUsername: 'maria_santos',
        category: 'Furniture',
        price: 15000,
        soldDate: '2024-03-16',
        imagePath: 'https://picsum.photos/200/306'
      },
      {
        productCode: 'PRD009',
        productName: 'Gaming Monitor',
        userUsername: 'juan_dela_cruz',
        buyerUsername: 'carlo_garcia',
        category: 'Electronics',
        price: 25000,
        soldDate: '2024-03-15',
        imagePath: 'https://picsum.photos/200/308'
      }
    ]
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch users data (same as UserManagement.jsx)
        const [adminsResponse, usersResponse] = await Promise.all([
          api.get('/admin/getAllAdmins'),
          api.get('/admin/users')
        ]);

        console.log('Fetched Users', usersResponse.data);
        console.log('Admin Response', adminsResponse.data);

        const totalUsers = usersResponse.data.length;

        // Fetch pending approvals data
        const approvalsResponse = await api.get('/product/pendingApproval');
        console.log('Products', approvalsResponse.data);
        const approvals = approvalsResponse.data;

        // Calculate stats
        const totalProducts = approvals.length;
        const approvedProducts = approvals.filter(p => p.status === 'Approved').length;
        const pendingApprovals = approvals.filter(p => p.status === 'Pending').length;
        const rejectedProducts = approvals.filter(p => p.status === 'Rejected').length;
        const soldProducts = approvals.filter(p => p.status === 'Sold').length;

        // Get most recent products (last 10)
        const recentProducts = approvals
          .slice(0, 10)
          .map(item => ({
            productCode: item.productCode,
            productName: item.productName,
            userUsername: item.userUsername,
            category: item.category,
            price: item.product?.buyPrice || 0,
            status: item.status === 'approved' ? 'Approved' : 
                   item.status === 'rejected' ? 'Rejected' : 
                   item.status === 'Available' ? 'Pending' : item.status,
            imagePath: item.product?.imagePath ? `http://localhost:8080/${item.product.imagePath}` : null
          }));

        console.log('Mapped recent products:', recentProducts);

        setDashboardData(prev => ({
          ...prev,
          stats: {
            totalUsers,
            totalProducts,
            pendingApprovals,
            approvedProducts,
            rejectedProducts
          },
          recentProducts
        }));

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const chartData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [{
      data: [
        dashboardData.stats.approvedProducts,
        dashboardData.stats.pendingApprovals,
        dashboardData.stats.rejectedProducts,
      ],
      backgroundColor: [
        '#28a745', // Approved - Green
        '#ffd700', // Pending - Gold
        '#dc3545'  // Rejected - Red
      ],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      }
    },
    cutout: '70%'
  };

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 },
      backgroundColor: '#fff3e0',
      minHeight: '100vh',
      overflowX: 'hidden'
    }}> 
      <Typography variant="h4" sx={{ 
        color: '#89343b', 
        mb: 3,
        fontWeight: 600,
        fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
      }}>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)'
        },
        gap: { xs: 1, sm: 2 },
        mb: 3
      }}>
        <Paper sx={{ 
          p: { xs: 1.5, sm: 2 },
          bgcolor: '#fff9c4',
          borderRadius: 1
        }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 600,
            color: '#89343b',
            mb: 1,
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}>
            {dashboardData.stats.totalUsers}
          </Typography>
          <Typography sx={{ 
            color: '#89343b',
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}>
            Total Users
          </Typography>
        </Paper>

        <Paper sx={{ 
          p: { xs: 1.5, sm: 2 },
          bgcolor: '#c8e6c9',
          borderRadius: 1
        }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 600,
            color: '#2e7d32',
            mb: 1,
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}>
            {dashboardData.stats.approvedProducts}
          </Typography>
          <Typography sx={{ 
            color: '#2e7d32',
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}>
            Approved Products
          </Typography>
        </Paper>

        <Paper sx={{ 
          p: { xs: 1.5, sm: 2 },
          bgcolor: '#bbdefb',
          borderRadius: 1
        }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 600,
            color: '#1565c0',
            mb: 1,
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}>
            {dashboardData.stats.pendingApprovals}
          </Typography>
          <Typography sx={{ 
            color: '#1565c0',
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}>
            Pending Approvals
          </Typography>
        </Paper>

        <Paper sx={{ 
          p: { xs: 1.5, sm: 2 },
          bgcolor: '#ffcdd2',
          borderRadius: 1
        }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 600,
            color: '#c62828',
            mb: 1,
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}>
            {dashboardData.stats.rejectedProducts}
          </Typography>
          <Typography sx={{ 
            color: '#c62828',
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}>
            Rejected Products
          </Typography>
        </Paper>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          lg: '1fr 2fr'
        },
        gap: { xs: 1, sm: 2 },
        mb: 3
      }}>
        {/* Product Approval Status Chart */}
        <Paper sx={{ 
          p: { xs: 1.5, sm: 2, md: 3 },
          bgcolor: 'white',
          borderRadius: 2,
          height: 'fit-content'
        }}>
          <Typography variant="h6" sx={{ 
            mb: 2,
            color: '#89343b',
            fontWeight: 600,
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}>
            Product Approval Status
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: { xs: 250, sm: 300 }
          }}>
            <Doughnut data={chartData} options={chartOptions} />
          </Box>
        </Paper>

        {/* Recent Products Table */}
        <Paper sx={{ 
          p: { xs: 1.5, sm: 2, md: 3 },
          bgcolor: 'white',
          borderRadius: 2
        }}>
          <Typography variant="h6" sx={{ 
            mb: 2,
            color: '#89343b',
            fontWeight: 600,
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}>
            Recent Products
          </Typography>
          <TableContainer sx={{ 
            maxHeight: { xs: 250, sm: 300 },
            '&::-webkit-scrollbar': {
              width: '6px'
            },
            '&::-webkit-scrollbar-track': {
              background: '#f5f5f5'
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#89343b',
              borderRadius: '3px'
            }
          }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    bgcolor: '#fff3e0',
                    color: '#89343b',
                    fontWeight: 600,
                    borderBottom: '2px solid #89343b',
                    whiteSpace: 'nowrap',
                    p: { xs: 1, sm: 2 }
                  }}>Product</TableCell>
                  <TableCell sx={{ 
                    bgcolor: '#fff3e0',
                    color: '#89343b',
                    fontWeight: 600,
                    borderBottom: '2px solid #89343b',
                    whiteSpace: 'nowrap',
                    p: { xs: 1, sm: 2 }
                  }}>Username</TableCell>
                  <TableCell sx={{ 
                    bgcolor: '#fff3e0',
                    color: '#89343b',
                    fontWeight: 600,
                    borderBottom: '2px solid #89343b',
                    whiteSpace: 'nowrap',
                    p: { xs: 1, sm: 2 }
                  }}>Category</TableCell>
                  <TableCell sx={{ 
                    bgcolor: '#fff3e0',
                    color: '#89343b',
                    fontWeight: 600,
                    borderBottom: '2px solid #89343b',
                    whiteSpace: 'nowrap',
                    p: { xs: 1, sm: 2 }
                  }}>Price</TableCell>
                  <TableCell sx={{ 
                    bgcolor: '#fff3e0',
                    color: '#89343b',
                    fontWeight: 600,
                    borderBottom: '2px solid #89343b',
                    whiteSpace: 'nowrap',
                    p: { xs: 1, sm: 2 }
                  }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashboardData.recentProducts.map((product) => (
                  <TableRow key={product.productCode} hover sx={{ 
                    '&:hover': { 
                      backgroundColor: '#fff8e1'
                    }
                  }}>
                    <TableCell sx={{ p: { xs: 1, sm: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {product.imagePath ? (
                          <Avatar
                            src={product.imagePath}
                            variant="rounded"
                            sx={{ 
                              width: { xs: 24, sm: 32 }, 
                              height: { xs: 24, sm: 32 }, 
                              mr: 1,
                              border: '1px solid #e0e0e0'
                            }}
                          />
                        ) : (
                          <Avatar 
                            variant="rounded"
                            sx={{ 
                              width: { xs: 24, sm: 32 }, 
                              height: { xs: 24, sm: 32 }, 
                              mr: 1,
                              bgcolor: '#f5f5f5',
                              border: '1px solid #e0e0e0'
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              No img
                            </Typography>
                          </Avatar>
                        )}
                        <Typography variant="body2" sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}>
                          {product.productName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ p: { xs: 1, sm: 2 } }}>
                      <Typography variant="body2" sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}>
                        {product.userUsername}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ p: { xs: 1, sm: 2 } }}>
                      <Typography variant="body2" sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}>
                        {product.category}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ p: { xs: 1, sm: 2 } }}>
                      <Typography variant="body2" sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}>
                        ₱{product.price ? product.price.toLocaleString() : '0'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ p: { xs: 1, sm: 2 } }}>
                      <Chip
                        label={product.status}
                        sx={{
                          bgcolor: 
                            product.status === 'Approved' ? '#28a745' :
                            product.status === 'Rejected' ? '#dc3545' :
                            product.status === 'Pending' ? '#007bff' :
                            product.status === 'Sold' ? '#6c757d' :
                            '#757575',
                          color: 'white',
                          height: { xs: '20px', sm: '24px' },
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          '& .MuiChip-label': {
                            px: { xs: 1, sm: 2 }
                          }
                        }}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Recently Sold Items */}
      <Paper sx={{ 
        p: { xs: 1.5, sm: 2, md: 3 },
        bgcolor: 'white',
        borderRadius: 2
      }}>
        <Typography variant="h6" sx={{ 
          mb: 2,
          color: '#89343b',
          fontWeight: 600,
          fontSize: { xs: '1rem', sm: '1.25rem' }
        }}>
          Recently Sold Items
        </Typography>
        <TableContainer sx={{ 
          maxHeight: { xs: 250, sm: 300 },
          '&::-webkit-scrollbar': {
            width: '6px'
          },
          '&::-webkit-scrollbar-track': {
            background: '#f5f5f5'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#89343b',
            borderRadius: '3px'
          }
        }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {['Product', 'Seller', 'Buyer', 'Category', 'Price', 'Sold Date'].map((header) => (
                  <TableCell key={header} sx={{ 
                    bgcolor: '#fff3e0',
                    color: '#89343b',
                    fontWeight: 600,
                    borderBottom: '2px solid #89343b',
                    whiteSpace: 'nowrap',
                    p: { xs: 1, sm: 2 }
                  }}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {dashboardData.recentlySold.map((item) => (
                <TableRow key={`${item.productCode}-${item.soldDate}`} hover sx={{ 
                  '&:hover': { 
                    backgroundColor: '#fff8e1'
                  }
                }}>
                  <TableCell sx={{ p: { xs: 1, sm: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={item.imagePath}
                        variant="rounded"
                        sx={{ 
                          width: { xs: 24, sm: 32 }, 
                          height: { xs: 24, sm: 32 }, 
                          mr: 1,
                          border: '1px solid #e0e0e0'
                        }}
                      />
                      <Typography variant="body2" sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}>
                        {item.productName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ p: { xs: 1, sm: 2 } }}>
                    <Typography variant="body2" sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}>
                      {item.userUsername}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ p: { xs: 1, sm: 2 } }}>
                    <Typography variant="body2" sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}>
                      {item.buyerUsername}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ p: { xs: 1, sm: 2 } }}>
                    <Typography variant="body2" sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}>
                      {item.category}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ p: { xs: 1, sm: 2 } }}>
                    <Typography variant="body2" sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}>
                      ₱{item.price.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ p: { xs: 1, sm: 2 } }}>
                    <Typography variant="body2" sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}>
                      {new Date(item.soldDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Dashboard;