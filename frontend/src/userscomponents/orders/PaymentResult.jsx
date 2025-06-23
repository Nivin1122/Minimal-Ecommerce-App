import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../endpoints/axiosInstance';

const PaymentResult = () => {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    
    const isSuccess = location.pathname.includes('success');
    const isCancel = location.pathname.includes('cancel');
    
    if (isSuccess) {
      const urlParams = new URLSearchParams(location.search);
      const sessionId = urlParams.get('session_id');


      
      if (sessionId) {
        setStatus('success');
        setMessage('Payment successful! Your order has been placed.');
        axiosInstance.post('admindashboard/orders/stripe/payment-status/',{sessionId})
        .then(res => {
          alert(res.data.message)
        })
        .catch(err=>{
          try{
            alert(err.response.message)
          }catch{}
        })
      } else {
        setStatus('error');
        setMessage('Payment verification failed.');
      }
    } else if (isCancel) {
      setStatus('cancelled');
      setMessage('Payment was cancelled. You can try again.');
    }
  }, [location]);

  const handleContinue = () => {
    if (status === 'success') {
      navigate('/user/orders');
    } else {
      navigate('/user/checkout');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '50vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      {status === 'loading' && (
        <div>
          <h2>Processing...</h2>
          <p>Please wait while we verify your payment.</p>
        </div>
      )}
      
      {status === 'success' && (
        <div>
          <h2 style={{ color: 'green' }}>✅ Payment Successful!</h2>
          <p>{message}</p>
          <button 
            onClick={handleContinue}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            View My Orders
          </button>
        </div>
      )}
      
      {status === 'cancelled' && (
        <div>
          <h2 style={{ color: 'orange' }}>⚠️ Payment Cancelled</h2>
          <p>{message}</p>
          <button 
            onClick={handleContinue}
            style={{
              backgroundColor: '#ff9800',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Try Again
          </button>
        </div>
      )}
      
      {status === 'error' && (
        <div>
          <h2 style={{ color: 'red' }}>❌ Payment Error</h2>
          <p>{message}</p>
          <button 
            onClick={handleContinue}
            style={{
              backgroundColor: '#f44336',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Back to Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentResult;