import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const GoogleLoginButton = () => {
  const handleSuccess = async credentialResponse => {
    try {
      const res = await axios.post('http://localhost:8000/users/google-login/', {
        id_token: credentialResponse.credential
      }, { withCredentials: true });
      if (res.data.success) window.location = '/';
    } catch (err) {
      console.error('Google login error:', err);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.error('Google Sign-In Failed')}
    />
  );
};

export default GoogleLoginButton;
