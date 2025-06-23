import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminAxiosInstance from '../../endpoints/adminAxiosInstance';

const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: ''
  });

  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await adminAxiosInstance.get('/products/list/');
        const targetProduct = res.data.products.find(p => p.id === parseInt(id));
        if (targetProduct) {
          setProduct({
            name: targetProduct.name,
            description: targetProduct.description,
            price: targetProduct.price,
            category: targetProduct.category, // should be ID
          });
          setExistingImage(`http://localhost:8000${targetProduct.image}`);
        } else {
          setMessage('Product not found');
        }
      } catch (err) {
        setMessage('Failed to fetch product');
        console.error(err);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await adminAxiosInstance.get('/products/category/list/');
        if (res.data.categories) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to fetch categories');
      }
    };

    fetchProduct();
    fetchCategories();
  }, [id]);

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
    formData.append('category', product.category); // ✅ append category

    if (image) {
      formData.append('image', image);
    }

    try {
      const res = await adminAxiosInstance.put(`/products/edit/${id}/`, formData);
      if (res.data.success) {
        setMessage('Product updated successfully!');
        setTimeout(() => navigate('/admin/products'), 1000);
      } else {
        setMessage('Update failed');
      }
    } catch (err) {
      setMessage('Error updating product');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Edit Product</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="text"
          name="name"
          value={product.name}
          onChange={handleChange}
          placeholder="Product Name"
          required
        />
        <textarea
          name="description"
          value={product.description}
          onChange={handleChange}
          placeholder="Description"
          required
        />
        <input
          type="number"
          name="price"
          value={product.price}
          onChange={handleChange}
          placeholder="Price"
          step="0.01"
          required
        />

        <select
          name="category"
          value={product.category}
          onChange={handleChange}
          required
        >
          <option value="">-- Select Category --</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleImageChange}
        />

        {existingImage && (
          <div style={{ marginTop: '10px' }}>
            <p>Current Image:</p>
            <img
              src={existingImage}
              alt="Current Product"
              style={{ width: '150px', height: 'auto', border: '1px solid #ccc' }}
            />
          </div>
        )}

        <button type="submit" style={{ marginTop: '10px' }}>Update Product</button>
      </form>
    </div>
  );
};

export default AdminEditProduct;