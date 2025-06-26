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
    <div className="min-h-screen flex items-center justify-center bg-violet-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10 space-y-8 border-2 border-violet-900">
        <h2 className="text-4xl font-extrabold text-violet-900 text-center mb-2">
          Welcome Back
        </h2>
        <p className="text-lg text-violet-900 text-center mb-6 font-medium">
          Sign in to your account
        </p>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-violet-900">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border-2 border-violet-900 rounded-lg focus:outline-none focus:border-violet-900 bg-white text-black"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-violet-900">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border-2 border-violet-900 rounded-lg focus:outline-none focus:border-violet-900 bg-white text-black"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 mt-2 bg-violet-900 text-white font-bold rounded-lg shadow-lg"
          >
            Login
          </button>
        </form>
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-violet-900"></div>
          <span className="mx-3 text-violet-900 font-semibold">or</span>
          <div className="flex-grow h-px bg-violet-900"></div>
        </div>
        <GoogleLoginButton />
      </div>
    </div>
  );
};

export default Login;
