import React, { useState } from 'react';
import { signup } from '../endpoints/api';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    
    console.log('Attempting signup with:', formData.username, formData.email);
    
    try {
      const result = await signup(formData.username, formData.email, formData.password);
      
      if (result.success) {
        console.log('✅ Signup successful!');
        setSignupSuccess(true);
        setFormData({ username: '', email: '', password: '' });
      } else {
        console.log('❌ Signup failed:', result.errors);
        setErrors(result.errors || {});
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ message: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  if (signupSuccess) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>✅ Account Created Successfully!</h2>
        <p>Your account has been created. You can now log in with your credentials.</p>
        <button 
          onClick={() => setSignupSuccess(false)}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Create Another Account
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Create Account</h2>
      
      {errors.message && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '15px' 
        }}>
          {errors.message}
        </div>
      )}
      
      <form onSubmit={handleSignup}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: errors.username ? '1px solid red' : '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          {errors.username && (
            <small style={{ color: 'red' }}>
              {Array.isArray(errors.username) ? errors.username.join(', ') : errors.username}
            </small>
          )}
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: errors.email ? '1px solid red' : '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          {errors.email && (
            <small style={{ color: 'red' }}>
              {Array.isArray(errors.email) ? errors.email.join(', ') : errors.email}
            </small>
          )}
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: errors.password ? '1px solid red' : '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          {errors.password && (
            <small style={{ color: 'red' }}>
              {Array.isArray(errors.password) ? errors.password.join(', ') : errors.password}
            </small>
          )}
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: isLoading ? '#6c757d' : '#28a745',
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      
      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <small>
          Already have an account? <a href="/login">Log in here</a>
        </small>
      </div>
    </div>
  );
};

export default Signup;