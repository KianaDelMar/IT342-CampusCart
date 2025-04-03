import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Button, Box, Menu, MenuItem, Avatar, Badge, Snackbar, Alert, Divider } from '@mui/material';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import ToastManager from './ToastManager';

const AdminHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchor, setAnchor] = React.useState(null);
  const [activeButton, setActiveButton] = useState('Dashboard');
  const firstName = sessionStorage.getItem('firstName');
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(''); 
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      title: 'Product Approval Request',
      content: 'New product "iPhone 15 Pro" needs your approval',
      time: '2 minutes ago', 
      read: false 
    },
    { 
      id: 2, 
      title: 'User Report',
      content: 'A user reported an issue with order #12345',
      time: '30 minutes ago', 
      read: false 
    },
    { 
      id: 3, 
      title: 'System Update',
      content: 'System maintenance and updates have been completed successfully',
      time: '1 hour ago', 
      read: false 
    },
    { 
      id: 4, 
      title: 'Product Approval Request',
      content: 'New product "iPhone 15 Pro" needs your approval',
      time: '1 hour ago', 
      read: false 
    },
    { 
      id: 5, 
      title: 'User Report',
      content: 'A user reported an issue with order #12345',
      time: '2 hours ago', 
      read: false 
    },
    { 
      id: 6, 
      title: 'System Update',
      content: 'System maintenance and updates have been completed successfully',
      time: '3 hours ago', 
      read: false 
    },
    { 
      id: 7, 
      title: 'Product Approval Request',
      content: 'New product "iPhone 15 Pro" needs your approval',
      time: '3 hours ago', 
      read: true 
    },
  ]);
  const [toasts, setToasts] = useState([]);

  const handleClick = (event) => {
    setAnchor(event.currentTarget);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/admin');
  };

  const handleClose = () => {
    setAnchor(null);
  };

  const handleButtonClick = (label) => {
    setActiveButton(label);
    switch(label) {
      case 'Dashboard':
        navigate('/admin/dashboard');
        break;
      case 'User Management':
        navigate('/admin/users');
        break;
      case 'Product Management':
        navigate('/admin/productsellers');
        break;
      case 'Product Approval':
        navigate('/admin/approvals');
        break;
      default:
        break;
    }
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const newToast = {
      id: Date.now(),
      message: 'All notifications marked as read',
      severity: 'success',
      open: true
    };
    setToasts(current => [newToast, ...current].slice(0, 2));
  };

  const baseButtonStyle = {
    width: '250px',
    color: 'white',
    height: '50px',
    borderRadius: '0px',
  };

  const activeButtonStyle = {
    bgcolor: '#ffd700',
    height: '50px',
    width: '250px',
    borderRadius: '0px',
    color: '#89343b',
   fontWeight: 'bold',
    boxShadow: 'inset 0px 4px 8px rgba(0, 0, 0, 0.4)',
  };

  useEffect(() => {
    switch (true) {
      case location.pathname === '/admin/dashboard':
        setActiveButton('Dashboard');
        break;
      case location.pathname === '/admin/users':
        setActiveButton('User Management');
        break;
      case location.pathname === '/admin/productsellers':
        setActiveButton('Product Management');
        break;
      case location.pathname === '/admin/approvals':
        setActiveButton('Product Approval');
        break;
      default:
        setActiveButton('');
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchProfileData = async () => {
      const username = sessionStorage.getItem('username');
      try {
        const response = await axios.get(`http://localhost:8080/api/admin/getAdminRecord/${username}`);
        if (response.status === 200) {
          const { profilePhoto } = response.data;

          if (profilePhoto) {
            setProfilePhoto(`http://localhost:8080/profile-images/${profilePhoto}`);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchProfileData();
  }, []);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <Box>
      <AppBar position="static" sx={{ backgroundColor: 'transparent', color: 'black', boxShadow: 1 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/admin/dashboard')}>
            <img
              src='/images/logoCIT.png'
              alt="Logo"
              
              style={{ width: '270px', height: '60px' }}
            />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={handleNotificationClick}
              edge="end"
              color="black"
              sx={{ 
                color: notificationAnchor ? '#89343b' : 'inherit',
                marginLeft: "10px",
                marginTop: "20px",
                '&:hover': { color: '#89343b' }
              }}
            >
              <Badge 
                badgeContent={unreadCount > 0 ? unreadCount : null}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    color: 'white',
                    fontSize: '12px',
                    height: '20px',
                    minWidth: '20px',
                    marginTop: '5px',   
                    marginRight: '3px'
                  }
                }}
              >
                <NotificationsNoneOutlinedIcon sx={{ fontSize: "30px" }}/>
              </Badge>
            </IconButton>
            <IconButton 
              onClick={handleClick}
              edge="end" 
              color="black" 
              aria-label="profile"
            >
              <Avatar src={profilePhoto} sx={{ width: 32, height: 32 }} />
              <Typography variant="subtitle1" sx={{ ml: 1 }}>
                {firstName}
              </Typography>
            </IconButton>
          </Box>
          <Menu
            anchorEl={anchor}
            open={Boolean(anchor)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 1,
                width: 200,
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)'
              }
            }}
          >
            <MenuItem
              sx={{
                color: 'gray',
                pointerEvents: 'none',
                fontWeight: 'bold',
                fontSize: '0.875rem',
                py: 1
              }}
            >
              Account
            </MenuItem>
            <MenuItem
              component={Link}
              to="/admin/settings"
              onClick={handleClose}
              sx={{
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
              }}
            >
              <SettingsOutlinedIcon sx={{ color: 'text.secondary' }} />
              <Typography>Settings</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClose();
                handleLogout();
              }}
              sx={{
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
              }}
            >
              <LogoutOutlinedIcon sx={{ color: 'text.secondary' }} />
              <Typography>Logout</Typography>
            </MenuItem>
          </Menu>
          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleNotificationClose}
            PaperProps={{
              sx: {
                mt: 0,
                width: 360,
                maxHeight: 480,
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '4px',
                },
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Notifications
              </Typography>
              <Button
                size="small"
                onClick={handleMarkAllAsRead}
                sx={{ 
                  color: '#89343b',
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'rgba(137, 52, 59, 0.04)' }
                }}
              >
                Mark all as read
              </Button>
            </Box>
            <Divider />
            
            <Box sx={{ maxHeight: 360, overflow: 'auto' }}>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <MenuItem
                    key={notification.id}
                    onClick={() => {
                      handleNotificationClose();
                      navigate('/admin/notifications');
                    }}
                    sx={{
                      py: 1.5,
                      px: 2,
                      borderLeft: notification.read ? 'none' : '4px solid #89343b',
                      bgcolor: notification.read ? 'inherit' : 'rgba(137, 52, 59, 0.03)',
                      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                    }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: notification.read ? 500 : 600,
                          color: notification.read ? 'text.secondary' : 'text.primary',
                          mb: 0.5
                        }}
                      >
                        {notification.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: notification.read ? 'text.secondary' : 'text.primary',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 0.5
                        }}
                      >
                        {notification.content}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notification.time}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No notifications
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Divider />
            <MenuItem
              onClick={() => {
                handleNotificationClose();
                navigate('/admin/notifications');
              }}
              sx={{
                justifyContent: 'center',
                color: '#89343b',
                py: 1.5,
                fontWeight: 500,
                '&:hover': { bgcolor: 'rgba(137, 52, 59, 0.04)' }
              }}
            >
              View All Notifications
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Nav Bar with Dividers */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        bgcolor: '#89343b', 
        height: '50px',
        alignItems: 'center',
        position: 'relative'
      }}>
        {['Dashboard', 'User Management', 'Product Management', 'Product Approval'].map((label, index, array) => (
          <React.Fragment key={label}>
            <Button
              onClick={() => handleButtonClick(label)}
              sx={activeButton === label ? activeButtonStyle : baseButtonStyle}
            >
              {label}
            </Button>
            {index < array.length - 1 && (
              <Box 
                sx={{ 
                  height: '30px',
                  width: '1px',
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                  alignSelf: 'center'
                }} 
              />
            )}
          </React.Fragment>
        ))}
      </Box>

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

export default AdminHeader;