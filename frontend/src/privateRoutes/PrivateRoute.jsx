// components/PrivateRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from '../endpoints/axiosInstance';

const PrivateRoute = ({ children }) => {
  const [authState, setAuthState] = useState({
    loading: true,
    isAuth: false,
    isAdmin: false
  });

  useEffect(() => {
    axiosInstance.get('users/authenticated/')
      .then(res => {
        console.log('Auth response:', res.data); // Debug log
        
        setAuthState({
          loading: false,
          isAuth: res.data.authenticated,
          isAdmin: res.data.is_staff || res.data.is_superuser
        });
      })
      .catch(error => {
        console.log('Auth error:', error);
        setAuthState({
          loading: false,
          isAuth: false,
          isAdmin: false
        });
      });
  }, []);

  const { loading, isAuth, isAdmin } = authState;

  // Show loading
  if (loading) {
    return <div>Checking authentication...</div>;
  }

  // Not authenticated - redirect to login
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // STRICT: If admin user tries to access user side, redirect to admin login
  if (isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  // Regular user - allow access
  return children;
};

export default PrivateRoute;