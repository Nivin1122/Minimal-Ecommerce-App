import React, { useEffect, useState } from 'react';
import axiosInstance from '../../endpoints/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';

const UserCheckout = () => {
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const stripePromise = loadStripe('pk_test_51RcqiJKrAJuSgafkTXAp7JTYirDSgRktuD7JNlc4TUItx177rsMG774xse2nH4uzqtQbpY7UtUz9xIIsRD3oCOdb00joclPj44');

  const handleStripeCheckout = async () => {
    if (!selectedAddress) {
      setMessage('Please select an address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await axiosInstance.post('admindashboard/orders/stripe/create-checkout/', { 
        address_id: selectedAddress 
      });
      
      if (res.data.success) {
        const stripe = await stripePromise;
        const result = await stripe.redirectToCheckout({ 
          sessionId: res.data.sessionId 
        });
        
        if (result.error) {
          setMessage(result.error.message);
        }
      } else {
        setMessage(res.data.message || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Stripe checkout error:', error);
      setMessage('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cart items
        const cartRes = await axiosInstance.get('admindashboard/products/cart/list/');
        setCart(cartRes.data.cart || []);

        // Fetch addresses
        const addressRes = await axiosInstance.get('users/address/list/');
        setAddresses(addressRes.data.addresses || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setMessage('Failed to load data. Please refresh the page.');
      }
    };

    fetchData();
  }, []);

  const totalPrice = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setMessage('Please select an address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await axiosInstance.post('admindashboard/orders/place-order/', {
        address_id: selectedAddress
      });
      
      if (res.data.success) {
        alert('Order placed successfully!');
        navigate('/user/orders'); 
      } else {
        setMessage(res.data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      setMessage('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && addresses.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Checkout</h2>
      {message && <p style={{ color: 'red', padding: '10px', backgroundColor: '#ffebee', borderRadius: '5px' }}>{message}</p>}

      <h3>Cart Items</h3>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.map(item => (
            <div key={item.id} style={{ 
              borderBottom: '1px solid #ccc', 
              padding: '15px 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{item.product.name}</p>
                <p style={{ margin: '0', color: '#666' }}>Price: ₹{item.product.price} × {item.quantity}</p>
              </div>
              <p style={{ margin: '0', fontWeight: 'bold' }}>₹{(item.product.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <h4 style={{ textAlign: 'right', marginTop: '20px', fontSize: '1.2em' }}>
            Total Price: ₹{totalPrice.toFixed(2)}
          </h4>
        </>
      )}

      <h3 style={{ marginTop: '30px' }}>Select Delivery Address</h3>
      {addresses.length === 0 ? (
        <p>No addresses found. Please add an address first.</p>
      ) : (
        <div>
          {addresses.map(addr => (
            <div key={addr.id} style={{ 
              border: selectedAddress === addr.id ? '2px solid #4CAF50' : '1px solid #ddd', 
              padding: '15px', 
              margin: '10px 0',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
            onClick={() => setSelectedAddress(addr.id)}
            >
              <input
                type="radio"
                name="address"
                value={addr.id}
                checked={selectedAddress === addr.id}
                onChange={() => setSelectedAddress(addr.id)}
                style={{ marginRight: '10px' }}
              />
              <strong>{addr.full_name}</strong><br />
              {addr.street}, {addr.city}, {addr.zip_code}
            </div>
          ))}
        </div>
      )}

      {cart.length > 0 && addresses.length > 0 && (
        <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
          <button 
            onClick={handlePlaceOrder} 
            disabled={loading || !selectedAddress}
            style={{
              backgroundColor: loading ? '#ccc' : '#4CAF50',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {loading ? 'Processing...' : 'Place Order (Cash on Delivery)'}
          </button>
          
          <button 
            onClick={handleStripeCheckout}
            disabled={loading || !selectedAddress}
            style={{
              backgroundColor: loading ? '#ccc' : '#6772E5',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {loading ? 'Processing...' : 'Pay with Card (Stripe)'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserCheckout;