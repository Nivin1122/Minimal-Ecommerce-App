import React, { useState, useEffect } from 'react';
import adminAxiosInstance from '../../endpoints/adminAxiosInstance';

const AdminAddProduct = () => {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',  // ✅ Added
  });
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]); // ✅ Added
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await adminAxiosInstance.get('/products/category/list/');
        setCategories(res.data.categories);
      } catch (err) {
        console.error('Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  const handleChange = e => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImageChange = e => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('price', product.price);
    formData.append('category', product.category); // ✅ Added
    formData.append('image', image);

    try {
      const res = await adminAxiosInstance.post('/products/add/', formData);
      if (res.data.success) {
        setMessage('Product added successfully!');
        setProduct({ name: '', description: '', price: '', category: '' });
        setImage(null);
      } else {
        setMessage('Failed to add product');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error while adding product');
    }
  };

  return (
    <div>
      <h2>Add New Product</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input type="text" name="name" value={product.name} onChange={handleChange} placeholder="Product Name" required />
        <textarea name="description" value={product.description} onChange={handleChange} placeholder="Description" required />
        <input type="number" name="price" value={product.price} onChange={handleChange} placeholder="Price" step="0.01" required />
        <input type="file" name="image" accept="image/*" onChange={handleImageChange} required />

        {/* ✅ Dropdown */}
        <select name="category" value={product.category} onChange={handleChange} required>
          <option value="">-- Select Category --</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <button type="submit">Add Product</button>
      </form>
    </div>
  );
};

export default AdminAddProduct;
