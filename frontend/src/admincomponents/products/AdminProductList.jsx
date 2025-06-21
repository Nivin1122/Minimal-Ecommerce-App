// pages/AdminProductList.jsx
import React, { useEffect, useState } from 'react';
import adminAxiosInstance from '../../endpoints/adminAxiosInstance';


const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await adminAxiosInstance.get('/products/list/');
        if (res.data.success) {
          setProducts(res.data.products);
        } else {
          setMessage('Failed to load products');
        }
      } catch (err) {
        console.error(err);
        setMessage('Error loading products');
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <h2>All Products (Admin View)</h2>
      {message && <p>{message}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {products.map((product, index) => (
          <div key={index} style={{ border: '1px solid #ccc', padding: 10, width: 200 }}>
            <img
              src={`http://localhost:8000${product.image}`}
              alt={product.name}
              style={{ width: '100%', height: 'auto' }}
            />
            <h4>{product.name}</h4>
            <p>{product.description}</p>
            <p><strong>₹{product.price}</strong></p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProductList;
