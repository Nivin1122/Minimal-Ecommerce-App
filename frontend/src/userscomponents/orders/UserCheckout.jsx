import React, { useEffect, useState } from 'react';
import axiosInstance from '../../endpoints/axiosInstance';
import { useNavigate } from 'react-router-dom';


const UserCheckout = () => {
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch cart items
    axiosInstance.get('admindashboard/products/cart/list/')
      .then(res => setCart(res.data.cart))
      .catch(() => setMessage('Failed to load cart'));

    // Fetch addresses
    axiosInstance.get('/users/address/list/')
      .then(res => setAddresses(res.data.addresses))
      .catch(() => setMessage('Failed to load addresses'));
  }, []);

  const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setMessage('Please select an address');
      return;
    }

    try {
      const res = await axiosInstance.post('/orders/place-order/', {
        address_id: selectedAddress
      });
      if (res.data.success) {
        alert('Order placed successfully!');
        navigate('/user/orders'); // Optional: user order history
      } else {
        setMessage(res.data.message);
      }
    } catch (err) {
      setMessage('Failed to place order');
    }
  };

  return (
    <div>
      <h2>Checkout</h2>
      {message && <p style={{ color: 'red' }}>{message}</p>}

      <h3>Cart Items</h3>
      {cart.map(item => (
        <div key={item.id} style={{ borderBottom: '1px solid #ccc', padding: 10 }}>
          <p><strong>{item.product.name}</strong></p>
          <p>Price: ₹{item.product.price}</p>
          <p>Qty: {item.quantity}</p>
        </div>
      ))}
      <h4>Total Price: ₹{totalPrice.toFixed(2)}</h4>

      <h3>Select Delivery Address</h3>
      {addresses.length === 0 ? (
        <p>No addresses found. Please add one.</p>
      ) : (
        addresses.map(addr => (
          <div key={addr.id} style={{ border: '1px solid gray', padding: 10, margin: 10 }}>
            <input
              type="radio"
              name="address"
              value={addr.id}
              onChange={() => setSelectedAddress(addr.id)}
            />
            <p>{addr.full_name}, {addr.street}, {addr.city}, {addr.zip_code}</p>
          </div>
        ))
      )}

      <button onClick={handlePlaceOrder} style={{ marginTop: 20 }}>Place Order (Cash on Delivery)</button>
    </div>
  );
};

export default UserCheckout;
