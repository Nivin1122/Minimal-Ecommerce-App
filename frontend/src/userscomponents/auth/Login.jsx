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
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#b6dfa9" }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl p-10 space-y-8 border-2"
        style={{ backgroundColor: "#fff", borderColor: "#529a3a" }}
      >
        <h2
          className="text-4xl font-extrabold text-center mb-2"
          style={{ color: "#529a3a" }}
        >
          Welcome Back
        </h2>
        <p
          className="text-lg text-center mb-6 font-medium"
          style={{ color: "#529a3a" }}
        >
          Sign in to your account
        </p>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label
              className="block text-sm font-semibold"
              style={{ color: "#529a3a" }}
            >
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none bg-white"
              style={{
                borderColor: "#b6dfa9",
                color: "#000",
              }}
            />
          </div>
          <div className="space-y-2">
            <label
              className="block text-sm font-semibold"
              style={{ color: "#529a3a" }}
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none bg-white"
              style={{
                borderColor: "#b6dfa9",
                color: "#000",
              }}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 mt-2 font-bold rounded-lg shadow-lg"
            style={{
              backgroundColor: "#529a3a",
              color: "#fff",
            }}
          >
            Login
          </button>
        </form>
        <div className="flex items-center my-4">
          <div
            className="flex-grow h-px"
            style={{ backgroundColor: "#b6dfa9" }}
          ></div>
          <span
            className="mx-3 font-semibold"
            style={{ color: "#529a3a" }}
          >
            or
          </span>
          <div
            className="flex-grow h-px"
            style={{ backgroundColor: "#b6dfa9" }}
          ></div>
        </div>
        <GoogleLoginButton />
      </div>
    </div>
  );
};

export default Login;
