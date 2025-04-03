import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext'; 

import Login from './Pages/LoginRegister/StudentLogin';
import MarketplaceHeader from './components/MarketplaceHeader';
import AdminHeader from './components/AdminHeader';

import './App.css';

const ProtectedAdminRoute = ({ children }) => {
  const userRole = sessionStorage.getItem('role');
  const navigate = useNavigate();
  
  React.useEffect(() => {
    if (userRole !== 'ADMIN') {
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
  
  React.useEffect(() => {
    if (!userRole || userRole === 'ADMIN') {
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
            
          </Routes>
        </div>
      </AuthProvider>
    </>
  );
};

export default App;
