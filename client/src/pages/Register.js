// client/src/pages/Register.js
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import GoogleLoginButton from '../components/GoogleLoginButton';
import '../styles/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: ''
  });
  const [error, setError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const { 
    register, 
    loading, 
    loginWithGoogle,
    verificationMessage, 
    clearVerificationMessage,
    verifyEmailCode,
    resendVerification
  } = useContext(AuthContext);
  
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    clearVerificationMessage();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      // Exclude confirmPassword from API request
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      setRegistrationSuccess(true);
      setShowVerification(true);
      setUserEmail(formData.email);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setVerificationError('');
    setVerificationLoading(true);
    
    try {
      await verifyEmailCode(userEmail, verificationCode);
      setShowVerification(false);
      setRegistrationSuccess(true);
      // Show success message and redirect to login
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Email verified successfully! You can now log in.' }
        });
      }, 2000);
    } catch (err) {
      setVerificationError(err.message || 'Verification failed. Please try again.');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleResendCode = async () => {
    setVerificationError('');
    try {
      await resendVerification(userEmail);
      setVerificationError('New verification code sent to your email!');
    } catch (err) {
      setVerificationError(err.message || 'Failed to resend code.');
    }
  };

  const handleGoogleLogin = async () => {
    clearVerificationMessage();
    setError('');
    try {
      await loginWithGoogle();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Google sign up failed. Please try again.');
    }
  };
  
  // If verification is successful, show success message
  if (registrationSuccess && !showVerification) {
    return (
      <div className="register-page">
        <div className="register-page__container">
          <div className="register-page__card">
            <h1 className="register-page__title">Registration Complete!</h1>
            <div className="register-page__alert register-page__alert--success">
              ✅ Your email has been verified successfully! You can now log in to your account.
              <div className="register-page__alert-link">
                <Link to="/login" className="register-page__link">
                  Go to login page
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show verification form
  if (showVerification) {
    return (
      <div className="register-page">
        <div className="register-page__container">
          <div className="register-page__card">
            <h1 className="register-page__title">Verify Your Email</h1>
            
            <div className="register-page__alert register-page__alert--info">
              📧 We've sent a 6-digit verification code to <strong>{userEmail}</strong>
              <br />
              Please enter the code below to complete your registration.
            </div>

            {verificationError && (
              <div className={`register-page__alert ${
                verificationError.includes('sent') ? 'register-page__alert--success' : 'register-page__alert--error'
              }`}>
                {verificationError}
              </div>
            )}

            <form onSubmit={handleVerificationSubmit} className="register-page__form">
              <div className="register-page__field">
                <label htmlFor="verificationCode" className="register-page__label">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  pattern="[0-9]{6}"
                  required
                  className="register-page__input register-page__input--code"
                  style={{ 
                    textAlign: 'center', 
                    fontSize: '1.5rem', 
                    letterSpacing: '0.5rem',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
              
              <button
                type="submit"
                disabled={verificationLoading || verificationCode.length !== 6}
                className="register-page__submit-btn"
              >
                {verificationLoading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            <div className="register-page__footer-text">
              <p>Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResendCode}
                className="register-page__link"
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Resend verification code
              </button>
            </div>

            <div className="register-page__footer-text">
              <button
                type="button"
                onClick={() => {
                  setShowVerification(false);
                  setRegistrationSuccess(false);
                  setVerificationCode('');
                  setVerificationError('');
                }}
                className="register-page__link"
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                ← Back to registration
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="register-page">
      <div className="register-page__container">
        <div className="register-page__card">
          <h1 className="register-page__title">Create an Account</h1>
          
          {error && (
            <div className="register-page__alert register-page__alert--error">
              {error}
            </div>
          )}

          {verificationMessage && (
            <div className="register-page__alert register-page__alert--success">
              {verificationMessage}
              <div className="register-page__alert-link">
                <Link to="/login" className="register-page__link">
                  Go to login page
                </Link>
              </div>
            </div>
          )}
          
          <GoogleLoginButton 
            onClick={handleGoogleLogin}
            loading={loading}
            text="Sign up with Google"
          />

          <div className="register-page__divider">
            <span className="register-page__divider-text">OR</span>
          </div>

          <form onSubmit={handleSubmit} className="register-page__form">
            <div className="register-page__field">
              <label htmlFor="fullName" className="register-page__label">Full Name</label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="register-page__input"
              />
            </div>
            
            <div className="register-page__field">
              <label htmlFor="email" className="register-page__label">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="register-page__input"
              />
            </div>
            
            <div className="register-page__field">
              <label htmlFor="password" className="register-page__label">Password</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                className="register-page__input"
              />
            </div>
            
            <div className="register-page__field">
              <label htmlFor="confirmPassword" className="register-page__label">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="6"
                className="register-page__input"
              />
            </div>
            
            <div className="register-page__field">
              <label htmlFor="city" className="register-page__label">City</label>
              <input
                type="text"
                id="city"
                value={formData.city}
                onChange={handleChange}
                className="register-page__input"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="register-page__submit-btn"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
          
          <p className="register-page__footer-text">
            Already have an account? <Link to="/login" className="register-page__link">Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;