import React, { useState } from 'react';
import adminAxiosInstance from '../../endpoints/adminAxiosInstance';


const AdminAddCategory = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await adminAxiosInstance.post('/products/category/add/', { name });
      if (res.data.success) {
        setMessage('✅ Category added successfully!');
        setName('');
      } else {
        setMessage('❌ Failed to add category');
      }
    } catch (err) {
      setMessage('❌ Error: ' + (err.response?.data?.errors?.name?.[0] || 'Something went wrong'));
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Add Category</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: '10px', width: '300px' }}
        />
        <button type="submit" style={{ marginLeft: '10px', padding: '10px' }}>Add</button>
      </form>
    </div>
  );
};

export default AdminAddCategory;
