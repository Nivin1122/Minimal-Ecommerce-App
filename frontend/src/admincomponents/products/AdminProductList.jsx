import React, { useEffect, useState } from 'react';
// import adminAxiosInstance from '../endpoints/adminAxiosInstance';
import adminAxiosInstance from '../../endpoints/adminAxiosInstance';
import { Link } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';  

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await adminAxiosInstance.get('/products/list/');
      if (res.data.success) {
        setProducts(res.data.products);
      } else {
        setMessage('Failed to load products');
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setMessage('Error loading products');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    try {
      const res = await adminAxiosInstance.delete(`/products/delete/${id}/`);
      if (res.data.success) {
        setProducts(prev => prev.filter(p => p.id !== id));
        setMessage('Product deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to delete product');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error deleting product');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Products</h1>
          <p className="text-gray-400 mt-2">Manage your product inventory</p>
        </div>
        <Link
          to="/admin/add-product"
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Message */}
      {message && (
        <div className="bg-teal-900 bg-opacity-50 border border-teal-700 text-teal-200 px-4 py-3 rounded-lg">
          {message}
        </div>
      )}

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
          <p className="text-gray-400 mb-6">Get started by adding your first product</p>
          <Link
            to="/admin/add-product"
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-teal-500 transition-colors duration-200">
              <div className="relative">
                <img
                  src={`http://localhost:8000${product.image}`}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className="bg-teal-600 text-white text-xs px-2 py-1 rounded-full">
                    {product.category_name}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-teal-400">
                    ₹{product.price}
                  </span>
                  <span className="text-gray-500 text-sm">ID: {product.id}</span>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/admin/products/edit/${product.id}`}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-center py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 border border-teal-600 text-teal-400 text-center py-2 rounded-lg font-medium transition-colors duration-200 hover:bg-teal-600 hover:text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProductList;
