import React, { useEffect, useState } from 'react';
import axiosInstance from '../../endpoints/axiosInstance';

const UserAddress = () => {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
  });
  const [message, setMessage] = useState('');

  const fetchAddresses = async () => {
    try {
      const res = await axiosInstance.get('/users/address/list/');
      setAddresses(res.data.addresses);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/users/address/add/', form);
      if (res.data.success) {
        setMessage('Address added!');
        setForm({ full_name: '', phone: '', street: '', city: '', state: '', postal_code: '', country: 'India' });
        fetchAddresses();
      } else {
        setMessage('Failed to add address');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await axiosInstance.delete(`/users/address/delete/${id}/`);
      fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  return (
    <div>
      <h2>Your Addresses</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input name="full_name" placeholder="Full Name" value={form.full_name} onChange={handleChange} required />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required />
        <textarea name="street" placeholder="Street Address" value={form.street} onChange={handleChange} required />
        <input name="city" placeholder="City" value={form.city} onChange={handleChange} required />
        <input name="state" placeholder="State" value={form.state} onChange={handleChange} required />
        <input name="postal_code" placeholder="Postal Code" value={form.postal_code} onChange={handleChange} required />
        <input name="country" placeholder="Country" value={form.country} onChange={handleChange} required />
        <button type="submit">Add Address</button>
      </form>

      <h3>Saved Addresses:</h3>
      {addresses.map(addr => (
        <div key={addr.id} style={{ border: '1px solid #ccc', padding: 10, margin: 10 }}>
          <p>{addr.full_name}, {addr.phone}</p>
          <p>{addr.street}, {addr.city}, {addr.state} - {addr.postal_code}, {addr.country}</p>
          <button onClick={() => deleteAddress(addr.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default UserAddress;
