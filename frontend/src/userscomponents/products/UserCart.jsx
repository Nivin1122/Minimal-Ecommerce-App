import React, { useEffect, useState } from 'react';
import axiosInstance from '../../endpoints/axiosInstance';
import { useNavigate } from 'react-router-dom';


const UserCart = () => {
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await axiosInstance.get('admindashboard/products/cart/list/');
      setCart(res.data.cart);
    } catch (err) {
      setMessage('Failed to load cart');
    }
  };

  const updateQuantity = async (itemId, action) => {
    try {
      await axiosInstance.patch(`admindashboard/products/cart/update-quantity/${itemId}/`, { action });
      fetchCart(); // Refresh the cart
    } catch (err) {
      console.error('Failed to update quantity', err);
    }
  };

  const removeItem = async (itemId) => {
    if (!window.confirm('Remove this item?')) return;

    try {
      await axiosInstance.delete(`admindashboard/products/cart/remove/${itemId}/`);
      setCart(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      alert('Failed to remove item');
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <div>
      <h2>Your Cart</h2>
      {message && <p>{message}</p>}
      {cart.length === 0 ? <p>No items in cart</p> : (
        cart.map(item => (
          <div key={item.id} style={{ borderBottom: '1px solid #ccc', padding: '10px' }}>
            <img src={`http://localhost:8000${item.product.image}`} alt={item.product.name} width="100" />
            <p><strong>{item.product.name}</strong></p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => updateQuantity(item.id, 'decrement')}>-</button>
              <span>Qty: {item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, 'increment')}>+</button>
            </div>

            <p>₹ {item.product.price * item.quantity}</p>
            <button onClick={() => removeItem(item.id)} style={{ color: 'red' }}>Remove</button>
          </div>
        ))
      )}
      <button onClick={() => navigate('/user/checkout')}>Proceed To Checkout</button>
    </div>
  );
};

export default UserCart;
