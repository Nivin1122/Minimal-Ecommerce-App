import React from 'react'
import { useNavigate } from 'react-router-dom';
import { adminLogout } from '../../endpoints/adminApi'

const AdminDashboard = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await adminLogout();
        navigate('/admin/login');
    };
  return (
    <div>
        <p>AdminDashboard</p>
        <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default AdminDashboard