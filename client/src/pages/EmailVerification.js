// client/src/pages/EmailVerification.js
import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const EmailVerification = () => {
  const { token } = useParams();
  const { verifyEmail, loading } = useContext(AuthContext);
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [hasAttempted, setHasAttempted] = useState(false); // Add this to prevent multiple attempts
  const navigate = useNavigate();

  useEffect(() => {
    const handleVerification = async () => {
      // Prevent multiple verification attempts
      if (!token || hasAttempted) {
        if (!token) {
          setVerificationStatus('error');
          setMessage('Invalid verification link. No token provided.');
        }
        return;
      }

      setHasAttempted(true); // Mark as attempted

      try {
        await verifyEmail(token);
        setVerificationStatus('success');
        setMessage('Email verified successfully! You can now log in to your account.');
        
        // Redirect to home page after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (error) {
        setVerificationStatus('error');
        setMessage(error.message || 'Email verification failed. The link may be expired or invalid.');
      }
    };

    handleVerification();
  }, [token, hasAttempted]); // Remove verifyEmail and navigate from dependencies

  if (loading || verificationStatus === 'verifying') {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold mb-2">Verifying Email</h2>
        <p className="text-gray-600">Please wait while we verify your email address...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center py-12">
      {verificationStatus === 'success' ? (
        <div>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">Email Verified!</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <p className="text-sm text-gray-500 mb-4">Redirecting you to the home page in a few seconds...</p>
          <Link 
            to="/" 
            className="inline-block bg-purple-700 hover:bg-purple-800 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go to Home Page
          </Link>
        </div>
      ) : (
        <div>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-700 mb-2">Verification Failed</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="space-y-3">
            <Link 
              to="/register" 
              className="block bg-purple-700 hover:bg-purple-800 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Register Again
            </Link>
            <Link 
              to="/login" 
              className="block text-purple-700 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailVerification;