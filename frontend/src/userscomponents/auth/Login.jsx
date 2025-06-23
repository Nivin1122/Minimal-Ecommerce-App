import React, { useState } from 'react';
import { login } from '../../endpoints/api';
import { useNavigate } from 'react-router-dom';
import GoogleLoginButton from './GoogleLoginButton';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(formData.username, formData.password);
    if (success) {
      navigate('/');
    } else {
      alert('Login failed');
    }
  };

  return (
    <>
    <form onSubmit={handleLogin}>
      <label>Username:</label><br />
      <input type="text" name="username" value={formData.username} onChange={handleChange} required />
      <br />
      <label>Password:</label><br />
      <input type="password" name="password" value={formData.password} onChange={handleChange} required />
      <br /><br />
      <button type="submit">Login</button>
    </form>
    <hr />
    <p>or</p>
    <GoogleLoginButton />
    </>

  );
};

export default Login;
