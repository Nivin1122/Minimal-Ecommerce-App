import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../endpoints/axiosInstance';
import Navbar from '../pages/Navbar';

const UserProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartProductIds, setCartProductIds] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axiosInstance.get(`admindashboard/products/detail/${id}/`);
        setProduct(res.data.product);
      } catch (err) {
        setProduct(null);
      }
      setLoading(false);
    };
    const fetchCart = async () => {
      try {
        const res = await axiosInstance.get('admindashboard/products/cart/list/');
        const ids = res.data.cart.map(item => item.product.id);
        setCartProductIds(ids);
      } catch (err) {
        setCartProductIds([]);
      }
    };
    fetchProduct();
    fetchCart();
  }, [id]);

  const handleAddToCart = async () => {
    if (cartProductIds.includes(Number(id))) {
      setMessage('Already in cart');
      return;
    }
    try {
      const res = await axiosInstance.post('admindashboard/products/cart/add/', {
        product_id: id,
        quantity: 1,
      });
      if (res.data.success) {
        setMessage('Product added to cart');
        setCartProductIds(prev => [...prev, Number(id)]);
        setTimeout(() => setMessage(''), 2000);
      } else {
        setMessage('Failed to add');
      }
    } catch (err) {
      setMessage('Error adding to cart');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!product) return <div className="p-8 text-center text-red-500">Product not found.</div>;

  return ( 
    <>
    <Navbar />
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 flex flex-col md:flex-row gap-8">
        <img
          src={`http://localhost:8000${product.image}`}
          alt={product.name}
          className="w-full md:w-1/2 h-72 object-cover rounded-lg"
        />
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h2 className="text-4xl font-bold mb-2">{product.name}</h2>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <div className="mb-4">
              <span className="text-3xl font-bold text-blue-600">₹{product.price}</span>
            </div>
            <div className="mb-6">
              <span className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                {product.category_name}
              </span>
            </div>
          </div>
          <div>
            {message && (
              <div className="mb-4 text-center">
                <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                  {message}
                </span>
              </div>
            )}
            <button
              onClick={handleAddToCart}
              disabled={cartProductIds.includes(Number(id))}
              className={`w-full px-6 py-3 rounded-lg font-semibold text-lg transition-colors duration-200 ${
                cartProductIds.includes(Number(id))
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {cartProductIds.includes(Number(id)) ? 'In Cart' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default UserProductDetail;