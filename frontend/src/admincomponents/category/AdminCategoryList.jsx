import React, { useEffect, useState } from 'react';
import adminAxiosInstance from '../../endpoints/adminAxiosInstance';
import { useNavigate } from 'react-router-dom';


const AdminCategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await adminAxiosInstance.get('products/category/list/');
        setCategories(res.data.categories || []);
      } catch (error) {
        setMessage('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  const handleEdit = (id) => {
    navigate(`/admin/category/edit/${id}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Category List</h2>
      {message && <p style={{ color: 'red' }}>{message}</p>}
      {categories.length === 0 ? (
        <p>No categories available.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ border: '1px solid #ccc', padding: '10px' }}>ID</th>
              <th style={{ border: '1px solid #ccc', padding: '10px' }}>Name</th>
              <th style={{ border: '1px solid #ccc', padding: '10px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id}>
                <td style={{ border: '1px solid #ccc', padding: '10px' }}>{cat.id}</td>
                <td style={{ border: '1px solid #ccc', padding: '10px' }}>{cat.name}</td>
                <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                  <button 
                    style={{ padding: '5px 10px', marginRight: '10px' }} 
                    onClick={() => handleEdit(cat.id)}
                  >
                    Edit
                  </button>
                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminCategoryList;
