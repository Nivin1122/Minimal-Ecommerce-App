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
        const cartRes = await axiosInstance.get('admindashboard/products/cart/list/');
        setCart(cartRes.data.cart || []);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Checkout</h1>
          <p className="text-lg text-gray-600">Complete your purchase</p>
        </div>

        {message && (
          <div className="mb-6 text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {message}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cart Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Summary</h2>
            {cart.length === 0 ? (
              <p className="text-gray-500">Your cart is empty.</p>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <img 
                      src={`http://localhost:8000${item.product.image}`} 
                      alt={item.product.name} 
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                      <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-blue-600">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-blue-600">₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Address Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Address</h2>
            {addresses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No addresses found. Please add an address first.</p>
                <button
                  onClick={() => navigate('/user/addresses')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Add Address
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map(addr => (
                  <div 
                    key={addr.id} 
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors duration-200 ${
                      selectedAddress === addr.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedAddress(addr.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="mt-1 text-blue-600"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{addr.full_name}</p>
                        <p className="text-gray-600 text-sm">{addr.street}</p>
                        <p className="text-gray-600 text-sm">{addr.city}, {addr.state} {addr.postal_code}</p>
                        <p className="text-gray-600 text-sm">{addr.country}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Payment Buttons */}
            {cart.length > 0 && addresses.length > 0 && (
              <div className="mt-6 space-y-3">
                <button 
                  onClick={handlePlaceOrder} 
                  disabled={loading || !selectedAddress}
                  className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? 'Processing...' : 'Place Order (Cash on Delivery)'}
                </button>
                
                <button 
                  onClick={handleStripeCheckout}
                  disabled={loading || !selectedAddress}
                  className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? 'Processing...' : 'Pay with Card (Stripe)'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCheckout;