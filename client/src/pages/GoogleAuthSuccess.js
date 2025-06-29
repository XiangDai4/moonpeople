// client/src/pages/GoogleAuthSuccess.js
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const GoogleAuthSuccess = () => {
  const { handleGoogleCallback, loading } = useContext(AuthContext);
  const [authStatus, setAuthStatus] = useState('processing');
  const [message, setMessage] = useState('');
  const [hasAttempted, setHasAttempted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const processGoogleAuth = async () => {
      if (hasAttempted) {
        return;
      }

      setHasAttempted(true);

      try {
        // Extract token from URL query parameters
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');

        if (!token) {
          throw new Error('No authentication token received');
          
        }

        // Validate token format (basic JWT structure check)
        if (!token.includes('.') || token.split('.').length !== 3) {
          throw new Error('Invalid authentication token format');
        }

        // Pass the token to the context handler
        await handleGoogleCallback(token);
        setAuthStatus('success');
        setMessage('Google authentication successful! Redirecting to home page...');
        
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch (error) {
        setAuthStatus('error');
        setMessage(error.message || 'Google authentication failed. Please try again.');
        
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    processGoogleAuth();
  }, [hasAttempted, location.search, handleGoogleCallback, navigate]);

  if (loading || authStatus === 'processing') {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold mb-2">Processing Authentication</h2>
        <p className="text-gray-600">Please wait while we complete your Google login...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center py-12">
      {authStatus === 'success' ? (
        <div>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">Login Successful!</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="animate-pulse text-sm text-gray-500">
            Redirecting to home page...
          </div>
        </div>
      ) : (
        <div>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-700 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/login')}
              className="block w-full bg-purple-700 hover:bg-purple-800 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Back to Login
            </button>
            <p className="text-sm text-gray-500">Redirecting automatically in 3 seconds...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleAuthSuccess;