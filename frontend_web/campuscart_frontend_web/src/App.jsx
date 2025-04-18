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
import BrowsePage from './Pages/Browse/BrowsePage';
import Bookmarks from './Pages/Profile/Bookmarks';
import UpdateProductForm from './Pages/Sell/UpdateProductForm';
import SellerView from './Pages/Sell/SellerView';
import ViewProduct from './Pages/Sell/ViewProduct';
import AdminLogin from './Pages/LoginRegister/AdminLogin';
import Dashboard from './Pages/Admin/Dashboard';
import ProductApproval from './Pages/Admin/ProductManagement/ProductApproval';

import './App.css';

const ProtectedAdminRoute = ({ children }) => {
  const userRole = sessionStorage.getItem('role');
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');
  
  React.useEffect(() => {
    if (!token || userRole !== 'ADMIN') {
      navigate('/login');
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
      navigate('/login');
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
           location.pathname !== '/login' && 
           location.pathname !== '/register' && 
           location.pathname !== '/admin' &&
           <MarketplaceHeader />}
          
          {isAdminRoute && <AdminHeader />}
          
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminLogin />} />
            
            {/* Protected User Routes */}
            <Route path="/home" element={<ProtectedUserRoute><HomePage /></ProtectedUserRoute>} />
            <Route path="/account" element={<ProtectedUserRoute><Settings /></ProtectedUserRoute>} />
            <Route path="/profile" element={<ProtectedUserRoute><Profile /></ProtectedUserRoute>} />
            <Route path="/addnewproduct" element={<AddProductForm />} />
            <Route path="/browse" element={<ProtectedUserRoute><BrowsePage /></ProtectedUserRoute>} />
            <Route path="/likes" element={<ProtectedUserRoute><Bookmarks /></ProtectedUserRoute>} />
            <Route path="/update/:code" element={<UpdateProductForm />} />
            <Route path="sell/product/:code" element={<SellerView />} /> 
            <Route path="/browse/product/:code" element={<ViewProduct section="Browse" />} />
            <Route path="/product/:code" element={<ViewProduct />} />
            <Route path="/profile/:username/product/:code" element={<ViewProduct />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedAdminRoute>
                <Dashboard />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/approvals" element={
              <ProtectedAdminRoute>
                <ProductApproval />
              </ProtectedAdminRoute>
            } />
            
          </Routes>
        </div>
      </AuthProvider>
    </>
  );
};

export default App;
