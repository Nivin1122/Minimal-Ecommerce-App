import React, { useEffect, useState } from 'react';
import axiosInstance from '../../endpoints/axiosInstance';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axiosInstance.get('/orders/user-orders/')
      .then(res => setOrders(res.data.orders))
      .catch(err => console.error('Failed to fetch orders', err));
  }, []);

  return (
    <div>
      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map(order => (
          <div key={order.id} style={{ border: '1px solid #ccc', margin: 10, padding: 10 }}>
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Placed on:</strong> {new Date(order.created_at).toLocaleString()}</p>
            <p><strong>Address:</strong> {order.address}</p>
            <h4>Items:</h4>
            {order.items.map((item, index) => (
              <div key={index} style={{ marginLeft: 20 }}>
                <p>{item.product.name} (x{item.quantity}) - ₹{item.product.price}</p>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default UserOrders;