import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import GoogleLoginButton from './GoogleLoginButton';

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: '', email: '', password: '', otp: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSendOtp = async () => {
    try {
      setIsLoading(true);
      await axios.post('http://localhost:8000/users/send-otp/', { email: formData.email });
      setOtpSent(true);
      alert('OTP sent to your email');
    } catch (err) {
      setErrors({ email: 'Failed to send OTP. Try valid email.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const res = await axios.post('http://localhost:8000/users/register/', formData);
      if (res.data.success) {
        setSignupSuccess(true);
        setFormData({ username: '', email: '', password: '', otp: '' });
        navigate('/login');
      } else {
        setErrors(res.data.errors || {});
      }
    } catch (err) {
      setErrors({ message: 'Something went wrong.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-violet-100 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-10 space-y-8 border-2 border-violet-900">
        <h2 className="text-4xl font-extrabold text-violet-900 text-center mb-2">
          Create Account
        </h2>

        {errors.message && (
          <div className="text-red-600 text-center mb-4">{errors.message}</div>
        )}

        <form onSubmit={handleSignup} className="space-y-3">
          <div className="mb-2">
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
            {errors.username && (
              <small className="text-red-600">{errors.username}</small>
            )}
          </div>

          <div className="mb-2">
            <label className="block text-sm font-semibold text-violet-900">
              Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border-2 border-violet-900 rounded-lg focus:outline-none focus:border-violet-900 bg-white text-black"
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isLoading}
                className="px-4 py-2 bg-violet-900 text-white rounded-lg font-semibold disabled:opacity-60 whitespace-nowrap"
              >
                Send OTP
              </button>
            </div>
            {errors.email && (
              <small className="text-red-600">{errors.email}</small>
            )}
          </div>

          {otpSent && (
            <div className="mb-2">
              <label className="block text-sm font-semibold text-violet-900">
                OTP
              </label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border-2 border-violet-900 rounded-lg focus:outline-none focus:border-violet-900 bg-white text-black"
              />
            </div>
          )}

          <div className="mb-2">
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
            {errors.password && (
              <small className="text-red-600">{errors.password}</small>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !otpSent}
            className="w-full py-2 mt-2 bg-violet-900 text-white font-bold rounded-lg shadow-lg disabled:opacity-60 whitespace-nowrap"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
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

export default Signup;