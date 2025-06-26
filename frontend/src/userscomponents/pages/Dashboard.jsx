import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../endpoints/api';
import axios from 'axios';

const TABS = [
  { key: 'addresses', label: 'Addresses' },
  { key: 'orders', label: 'Orders' },
  { key: 'cart', label: 'Cart' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('addresses');
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({ username: '', email: '' });
  const [addressForm, setAddressForm] = useState({
    full_name: '', phone: '', street: '', city: '', state: '', postal_code: '', country: 'India', is_default: false
  });
  const [addressError, setAddressError] = useState('');
  const [addressSuccess, setAddressSuccess] = useState('');

  useEffect(() => {
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    setUser({ username: username || '', email: email || '' });
    fetchAddresses();
    // Only fetch orders and cart if user is authenticated
    fetchOrders();
    fetchCart();
    // eslint-disable-next-line
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/users/address/list/', { withCredentials: true });
      setAddresses(res.data.addresses || []);
    } catch (err) {
      if (err.response && err.response.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:8000/orders/user-orders/', { withCredentials: true });
      setOrders(res.data.orders || []);
    } catch (err) {
      if (err.response && err.response.status === 401) navigate('/login');
    }
  };

  const fetchCart = async () => {
    try {
      const res = await axios.get('http://localhost:8000/admindashboard/products/cart/list/', { withCredentials: true });
      setCart(res.data.cart || []);
    } catch (err) {
      if (err.response && err.response.status === 401) navigate('/login');
    }
  };

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      navigate('/login');
    }
  };

  // Address form handlers
  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressError('');
    setAddressSuccess('');
    try {
      const res = await axios.post('http://localhost:8000/users/address/add/', addressForm, { withCredentials: true });
      if (res.data.success) {
        setAddressSuccess('Address added successfully.');
        setAddressForm({ full_name: '', phone: '', street: '', city: '', state: '', postal_code: '', country: 'India', is_default: false });
        fetchAddresses();
      } else {
        setAddressError('Failed to add address.');
      }
    } catch (err) {
      setAddressError('Failed to add address.');
    }
  };

  // Cart handlers
  const handleRemoveCartItem = async (itemId) => {
    await axios.delete(`http://localhost:8000/products/cart/remove/${itemId}/`, { withCredentials: true });
    fetchCart();
  };
  const handleUpdateCartQuantity = async (itemId, action) => {
    await axios.patch(`http://localhost:8000/products/cart/update-quantity/${itemId}/`, { action }, { withCredentials: true });
    fetchCart();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-violet-100 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 space-y-6 border-2 border-violet-900">
        <h2 className="text-3xl font-bold text-violet-900 text-center mb-2">User Dashboard</h2>
        <div className="mb-4 text-center">
          <p className="text-lg text-violet-900 font-semibold">
            {user.username && <>Username: {user.username}<br /></>}
            {user.email && <>Email: {user.email}</>}
          </p>
        </div>
        {/* Nav */}
        <div className="flex justify-center gap-4 border-b border-violet-900 pb-2 mb-4">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`px-4 py-2 font-semibold ${activeTab === tab.key ? 'text-white bg-violet-900' : 'text-violet-900 bg-violet-100'} rounded`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Tab Content */}
        {activeTab === 'addresses' && (
          <div>
            <h3 className="text-xl font-semibold text-violet-900 mb-2">Your Addresses</h3>
            {loading ? (
              <p>Loading addresses...</p>
            ) : addresses.length === 0 ? (
              <p className="text-gray-500">No addresses found.</p>
            ) : (
              <ul className="space-y-2 mb-4">
                {addresses.map(addr => (
                  <li key={addr.id} className="border border-violet-900 rounded p-2">
                    <div className="font-semibold">{addr.full_name}</div>
                    <div>{addr.street}, {addr.city}, {addr.state}, {addr.country} - {addr.postal_code}</div>
                    <div>Phone: {addr.phone}</div>
                    {addr.is_default && <span className="text-xs text-white bg-violet-900 px-2 py-1 rounded ml-2">Default</span>}
                  </li>
                ))}
              </ul>
            )}
            <form onSubmit={handleAddressSubmit} className="space-y-2 border-t border-violet-900 pt-4">
              <h4 className="text-lg font-semibold text-violet-900">Add New Address</h4>
              {addressError && <div className="text-red-600">{addressError}</div>}
              {addressSuccess && <div className="text-green-700">{addressSuccess}</div>}
              <div className="flex gap-2">
                <input name="full_name" value={addressForm.full_name} onChange={handleAddressChange} required placeholder="Full Name" className="w-1/2 px-2 py-1 border border-violet-900 rounded" />
                <input name="phone" value={addressForm.phone} onChange={handleAddressChange} required placeholder="Phone" className="w-1/2 px-2 py-1 border border-violet-900 rounded" />
              </div>
              <input name="street" value={addressForm.street} onChange={handleAddressChange} required placeholder="Street" className="w-full px-2 py-1 border border-violet-900 rounded" />
              <div className="flex gap-2">
                <input name="city" value={addressForm.city} onChange={handleAddressChange} required placeholder="City" className="w-1/3 px-2 py-1 border border-violet-900 rounded" />
                <input name="state" value={addressForm.state} onChange={handleAddressChange} required placeholder="State" className="w-1/3 px-2 py-1 border border-violet-900 rounded" />
                <input name="postal_code" value={addressForm.postal_code} onChange={handleAddressChange} required placeholder="Postal Code" className="w-1/3 px-2 py-1 border border-violet-900 rounded" />
              </div>
              <div className="flex gap-2 items-center">
                <input type="checkbox" name="is_default" checked={addressForm.is_default} onChange={handleAddressChange} className="border-violet-900" />
                <label className="text-sm text-violet-900">Set as default</label>
                <input name="country" value={addressForm.country} onChange={handleAddressChange} required placeholder="Country" className="w-1/2 px-2 py-1 border border-violet-900 rounded ml-2" />
              </div>
              <button type="submit" className="bg-violet-900 text-white px-4 py-2 rounded font-semibold">Add Address</button>
            </form>
          </div>
        )}
        {activeTab === 'orders' && (
          <div>
            <h3 className="text-xl font-semibold text-violet-900 mb-2">Your Orders</h3>
            {orders.length === 0 ? (
              <p className="text-gray-500">No orders found.</p>
            ) : (
              <ul className="space-y-2">
                {orders.map(order => (
                  <li key={order.id} className="border border-violet-900 rounded p-2">
                    <div className="font-semibold">Order #{order.id}</div>
                    <div>Date: {new Date(order.created_at).toLocaleString()}</div>
                    <div>Status: {order.status}</div>
                    <div>Address: {order.address}</div>
                    <div>Total: ₹{order.total_price}</div>
                    <div className="mt-1">
                      <span className="font-semibold">Items:</span>
                      <ul className="ml-4 list-disc">
                        {order.items.map((item, idx) => (
                          <li key={idx}>{item.product.name} x {item.quantity}</li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {activeTab === 'cart' && (
          <div>
            <h3 className="text-xl font-semibold text-violet-900 mb-2">Your Cart</h3>
            {cart.length === 0 ? (
              <p className="text-gray-500">Your cart is empty.</p>
            ) : (
              <ul className="space-y-2">
                {cart.map(item => (
                  <li key={item.id} className="border border-violet-900 rounded p-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div className="flex items-center gap-4">
                      <img
                        src={`http://localhost:8000${item.product.image}`}
                        alt={item.product.name}
                        className="w-14 h-14 rounded object-cover bg-gray-200"
                      />
                      <div>
                        <div className="font-semibold">{item.product.name}</div>
                        <div>Price: ₹{item.product.price}</div>
                        <div>Quantity: {item.quantity}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button onClick={() => handleUpdateCartQuantity(item.id, 'decrement')} className="px-2 py-1 bg-violet-900 text-white rounded">-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleUpdateCartQuantity(item.id, 'increment')} className="px-2 py-1 bg-violet-900 text-white rounded">+</button>
                      <button onClick={() => handleRemoveCartItem(item.id)} className="px-2 py-1 bg-red-700 text-white rounded">Remove</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full py-2 mt-4 bg-violet-900 text-white font-bold rounded-lg shadow-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;