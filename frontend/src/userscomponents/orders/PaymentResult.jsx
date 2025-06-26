import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../../endpoints/axiosInstance'; // Make sure this is the correct path

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const success = searchParams.get('success');
    const cancelled = searchParams.get('cancelled');
    const sessionId = searchParams.get('session_id');

    if (cancelled) {
      setStatus('cancelled');
      setMessage('Your payment was cancelled. You have not been charged.');
    } else if (success && sessionId) {
      // This is the crucial part: verify the payment with your backend
      verifyPayment(sessionId);
    } else {
      setStatus('error');
      setMessage('Invalid payment URL. Please contact support.');
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId) => {
    try {
      const res = await axiosInstance.post('/admindashboard/orders/check-payment-status/', { sessionId });

      if (res.data.success) {
        setStatus('success');
        setMessage(res.data.message || 'Payment successful and order placed!');
      } else {
        setStatus('error');
        setMessage(res.data.message || 'Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setStatus('error');
      setMessage('A server error occurred during payment verification. Please contact support.');
    }
  };

  const renderIcon = () => {
    switch (status) {
      case 'success':
        return (
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'cancelled':
      case 'error':
        return (
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default: // loading
        return (
          <div className="w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-blue-600"></div>
          </div>
        );
    }
  };

  const renderContent = () => {
    let title;
    let titleColor;

    switch (status) {
      case 'success':
        title = 'Payment Successful!';
        titleColor = 'text-green-700';
        break;
      case 'cancelled':
        title = 'Payment Cancelled';
        titleColor = 'text-red-700';
        break;
      case 'error':
        title = 'Payment Error';
        titleColor = 'text-red-700';
        break;
      default:
        title = 'Verifying Payment...';
        titleColor = 'text-gray-800';
        break;
    }

    return (
      <>
        <h1 className={`text-4xl font-bold mb-4 ${titleColor}`}>{title}</h1>
        <p className="text-lg text-gray-600 mb-8">{message}</p>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200"
          >
            Continue Shopping
          </button>
          {status === 'success' && (
            <button
              onClick={() => navigate('/user/orders')}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              View My Orders
            </button>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center bg-white p-10 rounded-xl shadow-lg">
        {renderIcon()}
        {renderContent()}
      </div>
    </div>
  );
};

export default PaymentResult;