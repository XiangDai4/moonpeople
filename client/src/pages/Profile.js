// client/src/pages/Profile.js
import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import '../styles/Profile.css'; // Import the custom CSS

const Profile = () => {
  const { user, updateProfile, loading, error: contextError } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    city: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Populate form with user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        city: user.city || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate passwords match if provided
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      // Only include password if provided
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        city: formData.city
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      await updateProfile(updateData);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      
      // Clear passwords
      setFormData({
        ...formData,
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    // Reset form to current user data
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        city: user.city || '',
        password: '',
        confirmPassword: ''
      });
    }
  };
  
  if (loading && !user) {
    return (
      <div className="profile-container">
        <div className="profile-loading">Loading profile...</div>
      </div>
    );
  }
  
  return (
    <div className="profile-container">
      <h1 className="profile-title">Your Profile</h1>
      
      {/* Error Messages */}
      {error && (
        <div className="profile-alert profile-alert-error">
          {error}
        </div>
      )}
      
      {contextError && (
        <div className="profile-alert profile-alert-error">
          {contextError}
        </div>
      )}
      
      {/* Success Messages */}
      {success && (
        <div className="profile-alert profile-alert-success">
          {success}
        </div>
      )}
      
      {/* Profile Display Mode */}
      {!isEditing ? (
        <div className="profile-display">
          <div className="profile-field">
            <span className="profile-field-label">Full Name</span>
            <p className="profile-field-value">
              {user?.fullName || 'Not provided'}
            </p>
          </div>
          
          <div className="profile-field">
            <span className="profile-field-label">Email</span>
            <p className="profile-field-value">
              {user?.email || 'Not provided'}
            </p>
          </div>
          
          <div className="profile-field">
            <span className="profile-field-label">City</span>
            <p className={`profile-field-value ${!user?.city ? 'empty' : ''}`}>
              {user?.city || 'Not specified'}
            </p>
          </div>
          
          <div className="profile-field">
            <span className="profile-field-label">Role</span>
            <span className="profile-role">
              {user?.role || 'User'}
            </span>
          </div>
          
          <div className="profile-actions">
            <button
              onClick={() => setIsEditing(true)}
              className="profile-btn profile-btn-primary"
            >
              Edit Profile
            </button>
          </div>
        </div>
      ) : (
        /* Profile Edit Mode */
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-form-group">
            <label htmlFor="fullName" className="profile-form-label">
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="profile-form-input"
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="profile-form-group">
            <label htmlFor="email" className="profile-form-label">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="profile-form-input"
              placeholder="Enter your email address"
            />
          </div>
          
          <div className="profile-form-group">
            <label htmlFor="city" className="profile-form-label">
              City
            </label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={handleChange}
              className="profile-form-input"
              placeholder="Enter your city (optional)"
            />
          </div>
          
          <div className="profile-form-group">
            <label htmlFor="password" className="profile-form-label">
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              minLength="6"
              className="profile-form-input"
              placeholder="Leave blank to keep current password"
            />
          </div>
          
          <div className="profile-form-group">
            <label htmlFor="confirmPassword" className="profile-form-label">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength="6"
              className="profile-form-input"
              placeholder="Confirm your new password"
            />
          </div>
          
          <div className="profile-btn-group">
            <button
              type="submit"
              disabled={loading}
              className="profile-btn profile-btn-primary"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            
            <button
              type="button"
              onClick={handleCancel}
              className="profile-btn profile-btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Profile;