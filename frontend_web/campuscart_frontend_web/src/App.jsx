import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext'; 

import Login from './Pages/LoginRegister/StudentLogin';
import Register from './Pages/LoginRegister/StudentRegister';
import MarketplaceHeader from './components/MarketplaceHeader';
import HomePage from './Pages/Home/HomePage';
import Profile from './Pages/Profile/UserProfile';
import Settings from './Pages/Profile/UserAccount';
import AdminHeader from './components/AdminHeader';
import AddProductForm from './Pages/Sell/AddProductForm';

import './App.css';

const ProtectedAdminRoute = ({ children }) => {
  const userRole = sessionStorage.getItem('role');
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');
  
  React.useEffect(() => {
    if (!token || userRole !== 'ADMIN') {
      navigate('/');
    }
  }, [userRole, navigate]);

  if (userRole !== 'ADMIN') {
    return null;
  }

  return children;
};

const ProtectedUserRoute = ({ children }) => {
  const userRole = sessionStorage.getItem('role');
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');

  
  React.useEffect(() => {
    if (!token ||  !userRole || userRole === 'ADMIN') {
      navigate('/');
      return;
    }
  }, [userRole, navigate]);

  return userRole && userRole !== 'ADMIN' ? children : null;
};

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin';

  return (
    <>
      <Toaster />
      <AuthProvider>
        <div>
          {!location.pathname.startsWith('/admin') && 
           location.pathname !== '/' && 
           location.pathname !== '/register' && 
           location.pathname !== '/admin' &&
           <MarketplaceHeader />}
          
          {isAdminRoute && <AdminHeader />}
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected User Routes */}
            <Route path="/home" element={<ProtectedUserRoute><HomePage /></ProtectedUserRoute>} />
            <Route path="/account" element={<ProtectedUserRoute><Settings /></ProtectedUserRoute>} />
            <Route path="/profile" element={<ProtectedUserRoute><Profile /></ProtectedUserRoute>} />
            <Route path="/addnewproduct" element={<AddProductForm />} />
            
          </Routes>
        </div>
      </AuthProvider>
    </>
  );
};

export default App;
