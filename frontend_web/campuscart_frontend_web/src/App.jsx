import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext'; 
import { LoadingProvider } from './contexts/LoadingContext';
import { MessageProvider } from './contexts/MessageContext';

import Login from './Pages/LoginRegister/StudentLogin';
import Register from './Pages/LoginRegister/StudentRegister';
import MarketplaceHeader from './components/MarketplaceHeader';
import GlobalLoader from './components/GlobalLoader';
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
import AdminSettings from './Pages/Admin/AdminSettings';
import ManageProducts from './Pages/Admin/ProductManagement/ManageProducts';
import UserManagement from './Pages/Admin/UserManagement/UserManagement';
import Messages from './Pages/Chat/Messages';
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
  const isAdminRoute = location.pathname.startsWith('/admin') && 
                      location.pathname !== '/admin' && 
                      location.pathname !== '/admin/';

  return (
    <>
      <Toaster />
      <LoadingProvider>
      <AuthProvider>
        <MessageProvider>
          <div>
            {!location.pathname.startsWith('/admin') && 
             location.pathname !== '/login' && 
             location.pathname !== '/register' && 
             location.pathname !== '/admin' &&
             location.pathname !== '/admin/' &&
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
              <Route path="/messages" element={<Messages />} />

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
              <Route path="/admin/settings" element={
                <ProtectedAdminRoute>
                  <AdminSettings />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/productsellers" element={
                <ProtectedAdminRoute>
                  <ManageProducts />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedAdminRoute>
                  <UserManagement />
                </ProtectedAdminRoute>
              } />
              
            </Routes>
          </div>
        </MessageProvider>
      </AuthProvider>
      <GlobalLoader />
</LoadingProvider>
    </>
  );
};

export default App;
