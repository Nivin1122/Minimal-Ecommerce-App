import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminAxiosInstance from '../../endpoints/adminAxiosInstance';


const AdminEditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await adminAxiosInstance.get(`products/category/list/`);
        const category = res.data.categories.find(cat => cat.id === parseInt(id));
        if (category) {
          setName(category.name);
        } else {
          setMessage('Category not found');
        }
      } catch (error) {
        setMessage('Error fetching category');
      }
    };

    fetchCategory();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await adminAxiosInstance.put(`products/category/edit/${id}/`, { name });
      if (res.data.success) {
        alert('Category updated!');
        navigate('/admin/category/list'); 
      } else {
        setMessage(res.data.message);
      }
    } catch (error) {
      setMessage('Update failed');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Edit Category</h2>
      {message && <p style={{ color: 'red' }}>{message}</p>}
      <form onSubmit={handleUpdate}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          required
          style={{ padding: '10px', width: '300px' }}
        />
        <br /><br />
        <button type="submit" style={{ padding: '10px 20px' }}>Update</button>
      </form>
    </div>
  );
};

export default AdminEditCategory;