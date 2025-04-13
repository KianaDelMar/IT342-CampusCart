import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData); 
    sessionStorage.setItem('username', userData.username);
    sessionStorage.setItem('firstName', userData.firstName);
    sessionStorage.setItem('lastName', userData.lastName);
    sessionStorage.setItem('address', userData.address);
    sessionStorage.setItem('contactNo', userData.contactNo);
    sessionStorage.setItem('email', userData.email);
    sessionStorage.setItem('role', userData.role);
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setUser(null);
    sessionStorage.clear(); 
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);