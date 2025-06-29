// client/src/pages/Login.js
import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import GoogleLoginButton from '../components/GoogleLoginButton';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  
  const { 
    login, 
    loading, 
    loginWithGoogle, 
    resendVerification,
    verificationMessage,
    clearVerificationMessage 
  } = useContext(AuthContext);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowResendVerification(false);
    clearVerificationMessage();
    
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      
      // Check if error is related to email verification
      if (errorMessage.toLowerCase().includes('verify') || 
          errorMessage.toLowerCase().includes('verification')) {
        setShowResendVerification(true);
        setResendEmail(email);
      }
    }
  };

  const handleGoogleLogin = async () => {
    clearVerificationMessage();
    setError('');
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Google login failed. Please try again.');
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerification(resendEmail);
      setShowResendVerification(false);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to resend verification email');
    }
  };
  
  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-card">
          <h1 className="login-title">Log In</h1>
          
          {error && (
            <div className="login-error">
              {error}
              {showResendVerification && (
                <div style={{ marginTop: '8px' }}>
                  <button
                    onClick={handleResendVerification}
                    className="login-resend-btn"
                    disabled={loading}
                  >
                    Click here to resend verification email
                  </button>
                </div>
              )}
            </div>
          )}

          {verificationMessage && (
            <div className="login-success">
              {verificationMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div>
              <label htmlFor="email" className="login-label">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-input"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="login-label">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="login-submit-btn"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <GoogleLoginButton 
            onClick={handleGoogleLogin}
            loading={loading}
            className="login-google-btn"
          />
          
          <div className="login-footer">
            <p>
              Don't have an account? <Link to="/register" className="login-register-link">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;