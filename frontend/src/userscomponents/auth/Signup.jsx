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
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Create Account</h2>

      {errors.message && <div style={{ color: 'red' }}>{errors.message}</div>}

      <form onSubmit={handleSignup}>
        <div>
          <label>Username:</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required />
          {errors.username && <small style={{ color: 'red' }}>{errors.username}</small>}
        </div>

        <div>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          <button type="button" onClick={handleSendOtp} disabled={isLoading}>Send OTP</button>
          {errors.email && <small style={{ color: 'red' }}>{errors.email}</small>}
        </div>

        {otpSent && (
          <div>
            <label>OTP:</label>
            <input type="text" name="otp" value={formData.otp} onChange={handleChange} required />
          </div>
        )}

        <div>
          <label>Password:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          {errors.password && <small style={{ color: 'red' }}>{errors.password}</small>}
        </div>

        <button type="submit" disabled={isLoading || !otpSent}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <hr />
      <p>or</p>
      <GoogleLoginButton />
    </div>
  );
};

export default Signup;