import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  Checkbox,
  TableSortLabel,
  Avatar,
  Grid,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  FileDownload as FileDownloadIcon,
  Block as BlockIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import AddUserModal from './AddUserModal';
import UpdateUserModal from './UpdateUserModal';
import axios from 'axios';
import api from '../../../config/axiosConfig';
import AddAdminModal from './AddAdminModal';
import { useLoading } from '../../../contexts/LoadingContext';

const UserManagement = () => {
  const { setLoading } = useLoading();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    role: ''
  });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [orderBy, setOrderBy] = useState('username');
  const [order, setOrder] = useState('asc');
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedUserForUpdate, setSelectedUserForUpdate] = useState(null);
  const [addMenuAnchorEl, setAddMenuAnchorEl] = useState(null);
  const [addAdminModalOpen, setAddAdminModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const [adminsResponse, usersResponse] = await Promise.all([
          api.get('/admin/getAllAdmins'),
          api.get('/admin/users')
        ]);

        const adminsWithRole = adminsResponse.data.map(admin => ({
          ...admin,
          role: 'Admin'
        }));

        const sellersWithRole = usersResponse.data.map(seller => ({
          ...seller,
          role: 'User'
        }));

        const combinedUsers = [...adminsWithRole, ...sellersWithRole]
          .filter((user, index, self) =>
            index === self.findIndex((t) => t.username === user.username)
          )
          .filter(user => user.role !== 'Admin'); // ✅ Exclude Admins


        setUsers(combinedUsers);
        setFilteredUsers(combinedUsers);

      } catch (error) {
        console.error('Error fetching users:', error);
        setToast({
          open: true,
          message: 'Error fetching users. Please try again later.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  //  search function
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    let filtered = [...users].filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const words = fullName.split(' ');

      return user.username.toLowerCase().startsWith(query) ||
        user.email.toLowerCase().startsWith(query) ||
        words.some(word => word.startsWith(query));
    });

    if (filters.status) {
      filtered = filtered.filter(user => user.status === filters.status);
    }
    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    setFilteredUsers(filtered);
    setPage(0);
  };

  // Handle user actions
  const handleUserAction = async (action, user) => {
    setLoading(true);
    switch (action) {
      case 'edit':
        try {
          setSelectedUserForUpdate(user);
          setUpdateModalOpen(true);
        } catch (error) {
          console.error('Error editing user:', error);
          setToast({
            open: true,
            message: error.response?.data?.message || 'Failed to edit user. Please try again.',
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
        break;

      case 'delete':
        try {
          const role = user.role === 'Admin' ? 'admin' : 'seller';
          const apiUrl = `http://localhost:8080/api/admin/deleteUser/${role}/${user.username}`;

          const response = await api.delete(apiUrl);

          if (response.status === 200) {
            // Refresh the data after successful deletion
            const [adminsResponse, usersResponse] = await Promise.all([
              api.get('/admin/getAllAdmins'),
              api.get('/admin/users')
            ]);

            const adminsWithRole = adminsResponse.data.map(admin => ({
              ...admin,
              role: 'Admin'
            }));

            const sellersWithRole = usersResponse.data.map(seller => ({
              ...seller,
              role: 'User'
            }));

            const combinedUsers = [...adminsWithRole, ...sellersWithRole].filter((user, index, self) =>
              index === self.findIndex((t) => t.username === user.username)
            );

            setUsers(combinedUsers);
            setFilteredUsers(combinedUsers);

            setToast({
              open: true,
              message: `User ${user.username} has been deleted successfully`,
              severity: 'success'
            });
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          setToast({
            open: true,
            message: error.response?.data?.message || 'Failed to delete user. Please try again.',
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
        break;

      default:
        setToast({
          open: true,
          message: 'Invalid action',
          severity: 'error'
        });
        break;
    }
    setActionAnchorEl(null);
  };

  // handles bulk selection
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = filteredUsers.map(user => user.username);
      setSelectedUsers(newSelected);
    } else {
      setSelectedUsers([]);
    }
  };

  // handlebulk delete
  const handleBulkDelete = async () => {
    setLoading(true);
    try {
      // Delete each selected user
      await Promise.all(
        selectedUsers.map(async (userId) => {
          const user = users.find(u => u.username === userId);
          if (user) {
            const role = user.role === 'Admin' ? 'admin' : 'seller';
            await api.delete(`/admin/deleteUser/${role}/${user.username}`);
          }
        })
      );

      // Refresh the data after successful deletions
      const [adminsResponse, usersResponse] = await Promise.all([
        api.get('/admin/getAllAdmins'),
        api.get('/admin/users')
      ]);

      const adminsWithRole = adminsResponse.data.map(admin => ({
        ...admin,
        role: 'Admin'
      }));

      const sellersWithRole = usersResponse.data.map(seller => ({
        ...seller,
        role: 'User'
      }));

      const combinedUsers = [...adminsWithRole, ...sellersWithRole].filter((user, index, self) =>
        index === self.findIndex((t) => t.username === user.username)
      );

      setUsers(combinedUsers);
      setFilteredUsers(combinedUsers);
      setSelectedUsers([]);

      setToast({
        open: true,
        message: 'Selected users have been deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error in bulk delete:', error);
      setToast({
        open: true,
        message: error.response?.data?.message || 'Failed to delete selected users. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Sorting function
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);

    const sortedUsers = [...filteredUsers].sort((a, b) => {
      if (property === 'name') {
        const nameA = `${a.firstName} ${a.lastName}`;
        const nameB = `${b.firstName} ${b.lastName}`;
        return (isAsc ? -1 : 1) * nameA.localeCompare(nameB);
      }
      // Handle numeric sorting for ID
      if (property === 'id') {
        return (isAsc ? -1 : 1) * (a[property] - b[property]);
      }
      // Default string sorting for other fields
      return (isAsc ? -1 : 1) * (a[property]?.toString().localeCompare(b[property]?.toString()) || 0);
    });

    setFilteredUsers(sortedUsers);
  };

  const handleSaveUser = async (updatedUser) => {
    setLoading(true);
    try {
      // Refresh the data immediately after successful update
      const [adminsResponse, usersResponse] = await Promise.all([
        api.get('/admin/getAllAdmins'),
        api.get('/admin/users')
      ]);

      const adminsWithRole = adminsResponse.data.map(admin => ({
        ...admin,
        role: 'Admin'
      }));

      const sellersWithRole = usersResponse.data.map(seller => ({
        ...seller,
        role: 'User'
      }));

      // Remove any duplicates and update state
      const combinedUsers = [...adminsWithRole, ...sellersWithRole].filter((user, index, self) =>
        index === self.findIndex((t) => t.username === user.username)
      );

      setUsers(combinedUsers);
      setFilteredUsers(combinedUsers);
      setUpdateModalOpen(false); // Close the modal after successful update
      setSelectedUserForUpdate(null); // Clear the selected user

      setToast({
        open: true,
        message: 'User updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error refreshing user data:', error);
      setToast({
        open: true,
        message: error.response?.data?.message || 'Error refreshing user data. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Add menu handler
  const handleAddClick = (event) => {
    setAddMenuAnchorEl(event.currentTarget);
  };

  const handleAddMenuClose = () => {
    setAddMenuAnchorEl(null);
  };

  const handleAddOptionClick = (type) => {
    handleAddMenuClose();
    if (type === 'user') {
      setAddUserModalOpen(true);
    } else if (type === 'admin') {
      setAddAdminModalOpen(true);
    }
  };

  const handleAddUser = (newUser) => {
    setLoading(true);
    // For sellers (no id needed as username is PK)
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);
    setToast({
      open: true,
      message: 'User added successfully',
      severity: 'success'
    });
    setLoading(false);
  };

  const handleAddAdmin = async (newAdmin) => {
    setLoading(true);
    try {
      // Fetch fresh data after adding new admin
      const [adminsResponse, usersResponse] = await Promise.all([
        api.get('/admin/getAllAdmins'),
        api.get('/admin/users')
      ]);

      const adminsWithRole = adminsResponse.data.map(admin => ({
        ...admin,
        role: 'Admin'
      }));

      const sellersWithRole = usersResponse.data.map(seller => ({
        ...seller,
        role: 'User'
      }));

      const combinedUsers = [...adminsWithRole, ...sellersWithRole].filter((user, index, self) =>
        index === self.findIndex((t) => t.username === user.username)
      );

      setUsers(combinedUsers);
      setFilteredUsers(combinedUsers);

      setToast({
        open: true,
        message: 'Admin added successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      setToast({
        open: true,
        message: 'Admin added but failed to refresh data. Please reload the page.',
        severity: 'warning'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Update</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this user?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setConfirmOpen(false);
              handleUserAction('delete', selectedUser);
            }}
            color="primary"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Box sx={{
        padding: 3,
        backgroundColor: '#fff3e0',
        minHeight: '100vh'
      }}>
        <Typography variant="h4" sx={{
          color: '#89343b',
          mb: 3,
          fontWeight: 600,
          fontSize: '2rem'
        }}>
          User Management
        </Typography>

        {/* Filter Section */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Search Input */}
            <Grid item xs={12} sm={4} md={4}>
              <TextField
                placeholder="Search users..."
                size="small"
                value={searchQuery}
                onChange={handleSearch}
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
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12} sm={4} md={4} sx={{ display: 'flex', justifyContent: "right", marginLeft: "auto", gap: 2 }}>
              {selectedUsers.length > 0 && (
                <Button
                  variant="contained"
                  startIcon={<DeleteIcon sx={{ color: 'white' }} />}
                  onClick={handleBulkDelete}
                  sx={{
                    bgcolor: '#d32f2f',
                    '&:hover': { bgcolor: '#b71c1c' },
                    '& .MuiButton-startIcon': {
                      margin: 0,
                      marginRight: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      color: 'white'
                    }
                  }}
                >
                  DELETE SELECTED
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddClick}
                sx={{
                  bgcolor: '#89343b',
                  '&:hover': { bgcolor: '#6d2931' },
                  '& .MuiButton-startIcon': {
                    margin: 0,
                    marginRight: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'white'
                  }
                }}
              >
                Add User
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Summary Cards */}
        <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
          <Card sx={{ p: 2, flex: 1, bgcolor: '#fff9c4', borderRadius: 1, border: '1px solid #ffd700' }}>
            <Typography variant="subtitle1" sx={{ color: '#89343b' }}>Users</Typography>
            <Typography variant="h4" sx={{ color: '#89343b', fontWeight: 600 }}>
              {users.filter(user => user.role === 'User').length}
            </Typography>
          </Card>
          {/*
            <Card sx={{ p: 2, flex: 1, bgcolor: '#c8e6c9', borderRadius: 1,  border: '1px solid #81c784'}}>
              <Typography variant="subtitle1" sx={{ color: '#2e7d32' }}>Admins</Typography>
              <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                {users.filter(user => user.role === 'Admin').length}
              </Typography>
            </Card>
            */}
        </Box>

        {/* Table Container */}
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
              <TableRow sx={{
                '& th': {
                  bgcolor: '#fff3e0',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  color: '#89343b',
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
                <TableCell padding="checkbox" sx={{
                  bgcolor: '#fff3e0',
                  color: '#89343b',
                  fontWeight: 600,
                  borderBottom: '2px solid #89343b'
                }}>
                  <Checkbox
                    indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                    checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell sx={{
                  bgcolor: '#fff3e0',
                  color: '#89343b',
                  fontWeight: 600,
                  borderBottom: '2px solid #89343b'
                }}>
                  <TableSortLabel
                    active={orderBy === 'username'}
                    direction={orderBy === 'username' ? order : 'asc'}
                    onClick={() => handleSort('username')}
                  >
                    Username
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{
                  bgcolor: '#fff3e0',
                  color: '#89343b',
                  fontWeight: 600,
                  borderBottom: '2px solid #89343b'
                }}>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{
                  bgcolor: '#fff3e0',
                  color: '#89343b',
                  fontWeight: 600,
                  borderBottom: '2px solid #89343b'
                }}>
                  <TableSortLabel
                    active={orderBy === 'email'}
                    direction={orderBy === 'email' ? order : 'asc'}
                    onClick={() => handleSort('email')}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{
                  bgcolor: '#fff3e0',
                  color: '#89343b',
                  fontWeight: 600,
                  borderBottom: '2px solid #89343b'
                }}>Contact No</TableCell>
                <TableCell sx={{
                  bgcolor: '#fff3e0',
                  color: '#89343b',
                  fontWeight: 600,
                  borderBottom: '2px solid #89343b'
                }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.username}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedUsers.includes(user.username)}
                        onChange={(event) => {
                          const newSelected = event.target.checked
                            ? [...selectedUsers, user.username]
                            : selectedUsers.filter(username => username !== user.username);
                          setSelectedUsers(newSelected);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          //src={user.profilePhoto ? `http://localhost:8080/api/images/profile/${user.profilePhoto}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                          src={user.profilePhoto && `http://localhost:8080/uploads/${user.profilePhoto}`}
                          alt={user.username}
                          sx={{ width: 40, height: 40 }}
                        />
                        {user.username}
                      </Box>
                    </TableCell>
                    <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.contactNo || 'N/A'}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => {
                          setSelectedUser(user);
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

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{
            backgroundColor: '#fff3e0',
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

        {/* Action Menu */}
        <Menu
          anchorEl={actionAnchorEl}
          open={Boolean(actionAnchorEl)}
          onClose={() => setActionAnchorEl(null)}
        >
          <MenuItem onClick={() => handleUserAction('edit', selectedUser)}>
            <EditIcon sx={{ mr: 1 }} /> Edit User
          </MenuItem>
          <MenuItem
            onClick={() => setConfirmOpen(true)}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 1 }} /> Delete User
          </MenuItem>
        </Menu>

        {/* Update User Modal */}
        <UpdateUserModal
          open={updateModalOpen}
          onClose={() => {
            setUpdateModalOpen(false);
            setSelectedUserForUpdate(null);
          }}
          user={selectedUserForUpdate}
          onSave={handleSaveUser}
        />

        {/*Toast */}
        <Snackbar
          open={toast.open}
          autoHideDuration={3000}
          onClose={() => setToast({ ...toast, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          TransitionProps={{ enter: true }}
          sx={{ maxWidth: '100%' }}
        >
          <Alert severity={toast.severity} sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        </Snackbar>

        {/* Add the menu */}
        <Menu
          anchorEl={addMenuAnchorEl}
          open={Boolean(addMenuAnchorEl)}
          onClose={handleAddMenuClose}
        >
          <MenuItem onClick={() => handleAddOptionClick('user')}>Add User</MenuItem>
          <MenuItem onClick={() => handleAddOptionClick('admin')}>Add Admin</MenuItem>
        </Menu>

        {/* Add both modals */}
        <AddUserModal
          open={addUserModalOpen}
          onClose={() => setAddUserModalOpen(false)}
          onAdd={handleAddUser}
        />

        <AddAdminModal
          open={addAdminModalOpen}
          onClose={() => setAddAdminModalOpen(false)}
          onAdd={handleAddAdmin}
        />
      </Box>
    </>
  );
};

export default UserManagement;