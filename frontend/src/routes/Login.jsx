import React, { useState } from 'react';
import { login } from '../endpoints/api';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    console.log('Attempting login with:', formData.username);
    
    try {
      const success = await login(formData.username, formData.password);
      console.log('Login result:', success);
      
      if (success) {
        console.log('Login successful! Checking cookies...');
        // Check cookies after login
        console.log('All cookies:', document.cookie);
      } else {
        console.log('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <div>
        <label>Username:</label><br />
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Password:</label><br />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>
      <br />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;