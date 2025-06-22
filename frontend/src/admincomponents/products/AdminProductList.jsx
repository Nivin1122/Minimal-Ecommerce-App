import React, { useEffect, useState } from 'react';
// import adminAxiosInstance from '../endpoints/adminAxiosInstance';
import adminAxiosInstance from '../../endpoints/adminAxiosInstance';
import { Link } from 'react-router-dom';

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    try {
      const res = await adminAxiosInstance.delete(`/products/delete/${id}/`);
      if (res.data.success) {
        setProducts(prev => prev.filter(p => p.id !== id)); // remove from UI
        setMessage('Product deleted successfully!');
      } else {
        setMessage('Failed to delete product');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error deleting product');
    }
  };

  return (
    <div>
      <h2>All Products (Admin View)</h2>
      {message && <p>{message}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {products.map((product) => (
          <div key={product.id} style={{ border: '1px solid #ccc', padding: 10, width: 200 }}>
            <img
              src={`http://localhost:8000${product.image}`}
              alt={product.name}
              style={{ width: '100%', height: 'auto' }}
            />
            <h4>{product.name}</h4>
            <p>{product.description}</p>
            <p><strong>₹{product.price}</strong></p>

            {/* Edit Button */}
            <Link to={`/admin/products/edit/${product.id}`}>
              <button style={{ marginRight: '10px' }}>Edit</button>
            </Link>

            {/* Delete Button with confirmation */}
            <button
              onClick={() => handleDelete(product.id)}
              style={{ backgroundColor: 'red', color: 'white' }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProductList;
