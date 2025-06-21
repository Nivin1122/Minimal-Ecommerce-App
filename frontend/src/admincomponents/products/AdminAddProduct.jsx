import React, { useState } from 'react';
import adminAxiosInstance from '../../endpoints/adminAxiosInstance';



const AdminAddProduct = () => {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
  });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');

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
    formData.append('image', image);

    try {
      const res = await adminAxiosInstance.post('/products/add/', formData);
      if (res.data.success) {
        setMessage('Product added successfully!');
        setProduct({ name: '', description: '', price: '' });
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
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleImageChange}
          required
        />
        <button type="submit">Add Product</button>
      </form>
    </div>
  );
};

export default AdminAddProduct;