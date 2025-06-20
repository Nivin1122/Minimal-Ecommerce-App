import React from 'react'
import { useNavigate } from 'react-router-dom';
import { logout } from '../endpoints/api';

const Dashboard = () => {

    const navigate = useNavigate();

    const handleLogout = async () => {
    const success = await logout();
    if (success) {
      console.log('Logout successful');
      navigate('/login');  

    } else {
      console.log('Logout failed');
    }
  };


  return (
    <div>
        <p>Dashboard</p>
        <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default Dashboard