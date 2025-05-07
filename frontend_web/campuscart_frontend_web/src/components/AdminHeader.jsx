import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Button, Box, Menu, MenuItem, Avatar, Badge, Snackbar, Alert, Divider } from '@mui/material';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../config/axiosConfig';
import ToastManager from './ToastManager';
import logoWithText from '../assets/img/logo-with-text.png';

const AdminHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchor, setAnchor] = React.useState(null);
  const [activeButton, setActiveButton] = useState('Dashboard');
  const firstName = sessionStorage.getItem('firstName');
  const [profilePhoto, setProfilePhoto] = useState('');
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
    switch (label) {
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
        const response = await api.get(`/admin/getAdminRecord/${username}`);
        if (response.status === 200) {
          const { profilePhoto } = response.data;

          if (profilePhoto) {
            setProfilePhoto(`data:image/jpeg;base64,${profilePhoto}`);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchProfileData();
  }, []);

  return (
    <Box>
      <AppBar position="static" sx={{ backgroundColor: 'transparent', color: 'black', boxShadow: 1 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/admin/dashboard')}>
            <img
              src={logoWithText}
              alt="Logo"
              style={{ width: '270px', height: '60px' }}
            />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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