import React, { useEffect, useState } from 'react';
// import adminAxiosInstance from '../../endpoints/adminAxiosInstance';
import adminAxiosInstance from '../../endpoints/adminAxiosInstance';


const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await adminAxiosInstance.get('/orders/all/');
      if (res.data.orders) setOrders(res.data.orders);
    } catch (err) {
      console.error('Error fetching orders', err);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await adminAxiosInstance.put(`/orders/update-status/${orderId}/`, {
        status: newStatus,
      });

      if (res.data.success) {
        setMessage('Order status updated!');
        fetchOrders(); // reload
      } else {
        setMessage('Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div>
      <h2>Admin - Manage Orders</h2>
      {message && <p>{message}</p>}
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map(order => (
          <div key={order.id} style={{ border: '1px solid #ccc', margin: 10, padding: 10 }}>
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>User Address:</strong> {order.address}</p>
            <p><strong>Total Price:</strong> ₹{order.total_price}</p>
            <p><strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}</p>

            <label>Status:</label>
            <select
              value={order.status}
              onChange={e => handleStatusChange(order.id, e.target.value)}
            >
              {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <div style={{ marginTop: 10 }}>
              <h4>Items:</h4>
              {order.items.map((item, index) => (
                <p key={index}>
                  {item.product.name} (x{item.quantity}) - ₹{item.product.price}
                </p>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminOrders;