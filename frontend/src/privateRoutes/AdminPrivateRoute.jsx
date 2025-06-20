import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import adminAxiosInstance from '../endpoints/adminAxiosInstance';


const AdminPrivateRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await adminAxiosInstance.get('/authenticated/');
        if (response.data.authenticated && response.data.user.is_staff) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  if (isAdmin === null) return <p>Checking admin access...</p>;

  return isAdmin ? children : <Navigate to="/admin/login" replace />;
};

export default AdminPrivateRoute;
