import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Button, Box, Menu, MenuItem, Avatar, Badge, Divider } from '@mui/material';
import Person2OutlinedIcon from '@mui/icons-material/Person2Outlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import AddProductForm from '../Pages/Sell/AddProductForm'
import toast from 'react-hot-toast';
import logoWithText from '../assets/img/logo-with-text.png';
import api from '../config/axiosConfig';
import { useLoading } from '../contexts/LoadingContext';


const MarketplaceHeader = () => {
  const [openModal, setOpenModal] = useState(false);
  const [activeButton, setActiveButton] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [anchor, setAnchor] = React.useState(null);
  const open = Boolean(anchor);
  const username = sessionStorage.getItem('username');
  const { setLoading } = useLoading();
  const [profilePhoto, setProfilePhoto] = useState(''); 
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      title: 'New Message',
      content: 'You have a new message from seller',
      time: '2 minutes ago', 
      read: false 
    },
    { 
      id: 2, 
      title: 'Product Liked',
      content: 'Someone liked your iPhone 15 Pro',
      time: '1 hour ago', 
      read: false 
    },
    { 
      id: 3, 
      title: 'Product Approved',
      content: 'Your product "MacBook Pro" has been approved',
      time: '3 hours ago', 
      read: true 
    },
    { 
      id: 4, 
      title: 'New Review',
      content: 'A buyer left a 5-star review on your Samsung Galaxy S23',
      time: '5 hours ago', 
      read: true 
    },
    { 
      id: 5, 
      title: 'Similar Product',
      content: 'A similar product to your "iPad Pro" was recently listed',
      time: '1 day ago', 
      read: true 
    },
    { 
      id: 6, 
      title: 'Account Security',
      content: 'New login detected from Chrome on Windows',
      time: '2 days ago', 
      read: true 
    }
  ]);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const handleClick = (event) => {
    setAnchor(event.currentTarget);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    sessionStorage.removeItem('token');
    navigate('/login');
  };
  const handleClose = () => {
      setAnchor(null);
  };

  const handleLikesClick = () => {
    navigate('/likes');
  };

  const handleMessageClick = () => {
    navigate('/messages');
  };
  
  const handleAddNewProduct = () => {
    navigate('/addnewproduct');
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleMarkAllAsRead = () => {
    if (notifications.some(n => !n.read)) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } else {
      toast.error('No unread notifications');
    }
    setNotificationAnchor(null);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const baseButtonStyle = { width: '250px', color: 'white' };
  const activeButtonStyle = {
    bgcolor: '#ffd700',
    height: '50px',
    width: '250px',
    borderRadius: '0px',
    color: '#89343b',
    fontWeight: 'bold',
    boxShadow: 'inset 0px 4px 8px rgba(0, 0, 0, 0.4)',
  };

  // active button
  useEffect(() => {
    switch (true) {
      case location.pathname === '/home':
        setActiveButton('Home');
        break;
      case location.pathname.startsWith('/browse'):
        setActiveButton('Browse');
        break;
      case location.pathname === '/sell' || location.pathname === '/addnewproduct' || /^\/sell\/product\/\d+$/.test(location.pathname):
        setActiveButton('Sell');
        break;
      case location.pathname === '/messages':
        setActiveButton('Message');
        break;
      case location.pathname === '/profile':
        setActiveButton('Profile');
        break;
      default:
        setActiveButton('');
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchProfileData = async () => {
        setLoading(true);
        const username = sessionStorage.getItem('username');
        try {
            const response = await api.get(`/user/getUserRecord/${username}`);
            if (response.status === 200) {
                const { profilePhoto } = response.data;

                if (profilePhoto) {
                    setProfilePhoto(`http://localhost:8080/uploads/${profilePhoto}`);
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
          setLoading(false); 
      }
    };

    fetchProfileData();
}, []);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!username) return;
      try {
        const response = await api.get(`/messages/unread/count/${username}`);
        setUnreadMessageCount(response.data);
      } catch (error) {
        setUnreadMessageCount(0);
      }
    };
    fetchUnreadCount();
  }, [username]);

  const handleButtonClick = (label) => {
    setActiveButton(label);

    switch (label) {
      case 'Home':
        navigate('/home');
        break;
      case 'Browse':
        navigate('/browse');
        break;
      case 'Sell':
        navigate('/sell');
        break;
      case 'Message':
        navigate('/messages');
        break;
      case 'Profile':
        navigate('/profile');
        break;
      default:
        navigate('/login');
    }
  };

  return (
    <Box>
      <AppBar position="static" sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
        <Toolbar sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          px: 3,
          minHeight: '70px',
          gap: 2
        }}>
          <IconButton 
            edge="start" 
            color="inherit" 
            aria-label="menu" 
            onClick={() => navigate('/home')}
            sx={{ p: 0, '&:hover': { backgroundColor: 'transparent' } }}
          >
            <img
              src={logoWithText}
              alt="Logo"
              style={{ width: '270px', height: '60px' }} 
            />
          </IconButton>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            flex: 1,
            justifyContent: 'flex-end'
          }}>
            <AddProductForm open={openModal} handleClose={handleCloseModal} />
            <Button
              variant="contained"
              onClick={handleOpenModal}
              sx={{
                backgroundColor: '#89343b',
                color: 'white',
                borderRadius: '8px',
                padding: '8px 24px',
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.95rem',
                boxShadow: 'none',
                minWidth: '80px',
                '&:hover': {
                  backgroundColor: '#7a2d34',
                  boxShadow: 'none',
                  transform: 'translateY(-1px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              Sell
            </Button>

            <IconButton 
              edge="end" 
              color="black" 
              aria-label="profile" 
              onClick={handleClick}
              sx={{
                borderRadius: '8px',
                padding: '8px 16px',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  transform: 'translateY(-1px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              <Avatar 
                src={profilePhoto} 
                sx={{ 
                  width: 36, 
                  height: 36,
                  marginRight: 1.5,
                  bgcolor: profilePhoto ? 'transparent' : '#89343b',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }} 
              >
                {!profilePhoto && username?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 500,
                  color: '#333',
                  fontSize: '0.95rem'
                }}
              >
                {username}
              </Typography>
            </IconButton>

            <IconButton 
              edge="end" 
              color="black" 
              onClick={handleLikesClick}
              sx={{
                padding: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  transform: 'translateY(-1px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              <FavoriteBorderOutlinedIcon sx={{ fontSize: 26, color: '#666' }}/>
            </IconButton>

            <IconButton
              onClick={handleNotificationClick}
              edge="end"
              color="black"
              sx={{
                padding: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  transform: 'translateY(-1px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              <Badge 
                badgeContent={unreadCount > 0 ? unreadCount : null}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    color: 'white',
                    border: '1px solid white',
                    fontSize: '11px',
                    height: '18px',
                    minWidth: '18px',
                    top: 2,
                    right: 2,
                    backgroundColor: '#89343b'
                  }
                }}
              >
                <NotificationsNoneOutlinedIcon sx={{ fontSize: 26, color: '#666' }}/>
              </Badge>
            </IconButton>

            <IconButton 
              edge="end" 
              color="black" 
              onClick={handleMessageClick}
              sx={{
                padding: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  transform: 'translateY(-1px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              <Badge 
                badgeContent={unreadMessageCount} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    color: 'white',
                    border: '1px solid white',
                    fontSize: '11px',
                    height: '18px',
                    minWidth: '18px',
                    top: 2,
                    right: 2,
                    backgroundColor: '#89343b'
                  }
                }}
              >
                <MailOutlineOutlinedIcon sx={{ fontSize: 26, color: '#666' }} />
              </Badge>
            </IconButton>
          </Box>

          <AddProductForm open={openModal} handleClose={handleCloseModal} />

          <Menu
            anchorEl={anchor}
            open={open}
            onClose={handleClose}
            sx={{
                '& .MuiPaper-root': {
                    backgroundColor: '#f0f0f0', 
                    color: '#333', 
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', 
                },
            }}
          >
            <MenuItem
                onClick={handleClose}
                sx={{
                    '&:hover': {
                        backgroundColor: 'white', 
                    },
                }}
            >
                <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit'}}> 
                  <Person2OutlinedIcon style={{ verticalAlign: 'middle', marginBottom: '5px', marginLeft: '-5px' }}/> 
                  <span style={{ marginLeft: '10px', textDecoration: 'none', color: 'inherit', fontSize: '16px' }}>Profile</span>
                </Link>
            </MenuItem>

            <Typography
              variant="body2"
              sx={{
                marginLeft: 2,
                marginTop: 1,
                marginBottom: 0.5,
                color: "gray",
                fontWeight: "bold",
                textDecoration: 'none'
              }}
            >
              Buying
            </Typography>
            <MenuItem
                onClick={handleClose}
                sx={{
                    '&:hover': {
                        backgroundColor: 'white',
                    },
                }}
            >
            <Link to="/likes" style={{ textDecoration: 'none', color: 'inherit'}}> 
                <FavoriteBorderOutlinedIcon style={{ verticalAlign: 'middle', marginBottom: '5px', marginLeft: '-5px' }}/> 
                <span style={{ marginLeft: '10px', textDecoration: 'none', color: 'inherit', fontSize: '16px' }}>Likes</span>
            </Link>
            </MenuItem>

            <Typography
              variant="body2"
              sx={{
                marginLeft: 2,
                marginTop: 1,
                marginBottom: 0.5,
                color: "gray",
                fontWeight: "bold",
                textDecoration: 'none'
              }}
            >
              Account
            </Typography>
            <MenuItem
                onClick={handleClose}
                sx={{
                    '&:hover': {
                        backgroundColor: 'white',
                    },
                }}
            ><Link to="/account" style={{ textDecoration: 'none', color: 'inherit' }}>
            <SettingsOutlinedIcon fontSize='medium' style={{ verticalAlign: 'middle', marginBottom: '5px', marginLeft: '-5px' }}/> 
            <span style={{ marginLeft: '10px', textDecoration: 'none', color: 'inherit', fontSize: '16px' }}>Settings</span>
            </Link>
            </MenuItem>
            <MenuItem
                onClick={() => {
                  handleClose(); 
                  handleLogout(); 
              }}
                sx={{
                  display: 'flex',       
                  alignItems: 'center',
                    '&:hover': {
                        backgroundColor: 'white',
                    },
                }}
            >
              <LogoutOutlinedIcon style={{ marginLeft: '-4px', marginRight: '8px' }} />
                Logout
            </MenuItem>
        </Menu>
        {/* Notification Menu */}
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
                    navigate('/notifications');
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
              navigate('/notifications');
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

      {/* Nav Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'center', bgcolor: '#89343b', height: '50px' }}>
        {['Home', 'Browse', 'Message', 'Profile'].map((label, index) => (
          <React.Fragment key={label}>
            <Button
              sx={activeButton === label ? activeButtonStyle : baseButtonStyle}
              onClick={() => handleButtonClick(label)}
            >
              {label}
            </Button>
            {index < 3 && ( 
              <Divider 
                orientation="vertical" 
                flexItem 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                  height: '30px',
                  my: 'auto' 
                }} 
              />
            )}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

export default MarketplaceHeader;