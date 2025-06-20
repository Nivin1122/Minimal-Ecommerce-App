// components/PrivateRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from '../endpoints/axiosInstance';

const PrivateRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    axiosInstance.get('/authenticated/')
      .then(res => setIsAuth(res.data.authenticated))
      .catch(() => setIsAuth(false));
  }, []);

  if (isAuth === null) return <p>Checking auth...</p>;

  return isAuth ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
