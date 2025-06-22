import React, { useEffect, useState } from 'react';
import axiosInstance from '../../endpoints/axiosInstance';
import { useNavigate } from 'react-router-dom';

const UserProductList = () => {
  const [products, setProducts] = useState([]);
  const [cartProductIds, setCartProductIds] = useState([]);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();


  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get('admindashboard/products/list/');
      setProducts(res.data.products);
    } catch (err) {
      console.error(err);
    }
  };


  const fetchCart = async () => {
    try {
      const res = await axiosInstance.get('admindashboard/products/cart/list/');
      const ids = res.data.cart.map(item => item.product.id);
      setCartProductIds(ids);
    } catch (err) {
      console.error('Cart fetch error:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  const handleAddToCart = async (productId) => {
    if (cartProductIds.includes(productId)) {
      setMessage('Already in cart');
      return;
    }

    try {
      const res = await axiosInstance.post('admindashboard/products/cart/add/', {
        product_id: productId,
        quantity: 1,
      });

      if (res.data.success) {
        setMessage('Product added to cart');
        setCartProductIds(prev => [...prev, productId]);
        navigate('/cart')
      } else {
        setMessage('Failed to add');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error adding to cart');
    }
  };

  return (
    <div>
      <h2>Products</h2>
      {message && <p>{message}</p>}

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
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

            {cartProductIds.includes(product.id) ? (
              <button disabled style={{ background: '#aaa' }}>Already in Cart</button>
            ) : (
              <button onClick={() => handleAddToCart(product.id)}>Add to Cart</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProductList;
