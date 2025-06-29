// client/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationMessage, setVerificationMessage] = useState(null);

  // Utility function to check token expiration
  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  // Initialize auth state from localStorage with token expiration check
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.token && isTokenExpired(user.token)) {
          // Token is expired, remove from storage
          localStorage.removeItem('user');
          setUser(null);
        } else {
          setUser(user);
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  // Register user (now with email verification)
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    setVerificationMessage(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setVerificationMessage(data.message || 'Please check your email for a 6-digit verification code');
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Verify email with 6-digit code
  const verifyEmailCode = async (email, code) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Email verification failed');
      }

      setVerificationMessage(data.message || 'Email verified successfully!');
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Verify email with token (Legacy support)
  const verifyEmail = async (token) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/verify-email/${token}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Email verification failed');
      }

      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Resend verification email/code
  const resendVerification = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification code');
      }

      setVerificationMessage(data.message || 'New verification code sent successfully');
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login user (now checks for email verification)
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const loginWithGoogle = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

  // Handle Google OAuth callback success - UPDATED to accept token parameter
  const handleGoogleCallback = async (token) => {
    setLoading(true);
    setError(null);
    try {
      // Validate token format (basic JWT structure check)
      if (!token || !token.includes('.') || token.split('.').length !== 3) {
        throw new Error('Invalid authentication token format');
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        throw new Error('Authentication token has expired');
      }

      // Use the token to get user data
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/profile`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const userData = await response.json();
      
      if (!response.ok) {
        throw new Error(userData.message || 'Authentication failed');
      }

      // Create user object with token (same format as regular login)
      const userWithToken = {
        _id: userData._id,
        fullName: userData.fullName,
        email: userData.email,
        city: userData.city,
        role: userData.role,
        isVerified: userData.isVerified,
        token: token
      };

      setUser(userWithToken);
      localStorage.setItem('user', JSON.stringify(userWithToken));
      return userWithToken;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user - UPDATED to handle JWT tokens properly
  const logout = async () => {
    try {
      // Only call logout endpoint if we have a token
      if (user?.token) {
        await fetch(`${process.env.REACT_APP_API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Clear verification message
  const clearVerificationMessage = () => {
    setVerificationMessage(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        verificationMessage,
        register,
        login,
        logout,
        updateProfile,
        verifyEmail, // Legacy token-based verification
        verifyEmailCode, // New 6-digit code verification
        resendVerification,
        loginWithGoogle,
        handleGoogleCallback,
        clearError,
        clearVerificationMessage,
        isAuthenticated: !!user && !!user.token, // UPDATED to check both user and token
        isAdmin: user?.role === 'admin',
        isVolunteer: user?.role === 'volunteer' || user?.role === 'admin',
        isEmailVerified: user?.isVerified
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;