// components/AdminPrivateRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from '../endpoints/axiosInstance';

const AdminPrivateRoute = ({ children }) => {
  const [authState, setAuthState] = useState({
    loading: true,
    isAuth: false,
    isAdmin: false
  });

  useEffect(() => {
    axiosInstance.get('users/authenticated/')
      .then(res => {
        setAuthState({
          loading: false,
          isAuth: res.data.authenticated,
          isAdmin: res.data.is_staff || res.data.is_superuser
        });
      })
      .catch(error => {
        setAuthState({
          loading: false,
          isAuth: false,
          isAdmin: false
        });
      });
  }, []);

  const { loading, isAuth, isAdmin } = authState;

  if (loading) {
    return <div>Checking admin access...</div>;
  }

  // Not authenticated - redirect to admin login
  if (!isAuth) {
    return <Navigate to="/admin/login" replace />;
  }

  // Not admin - redirect to admin login
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  // Admin user - allow access
  return children;
};

export default AdminPrivateRoute;