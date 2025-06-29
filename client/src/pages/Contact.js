// client/src/pages/Contact.js
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import '../styles/Contact.css';

const Contact = () => {
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: user?.name || user?.firstName || '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: '',
    loading: false
  });
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setFormStatus({
      submitted: false,
      success: false,
      message: '',
      loading: true
    });
    
    try {
      const messageData = {
        name: formData.name || 'Anonymous User',
        email: user?.email || 'no-email@example.com',
        subject: formData.subject,
        message: formData.message,
        userId: user?.id
      };
      
      console.log('Submitting contact form with data:', messageData);
      
      const response = await api.submitContactMessage(messageData);
      
      setFormStatus({
        submitted: true,
        success: true,
        message: response.message || 'Thank you for your message! We will get back to you soon.',
        loading: false
      });
      
      // Reset form (but keep the name field populated)
      setFormData({
        name: formData.name,
        subject: '',
        message: ''
      });
      
    } catch (error) {
      console.error('Contact form submission error:', error);
      setFormStatus({
        submitted: true,
        success: false,
        message: error.message || 'Sorry, there was an error sending your message. Please try again later.',
        loading: false
      });
    }
  };

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="contact-container">
        <h1 className="contact-title">Contact Us</h1>
        
        <div className="contact-grid">
          {/* Contact Info Section */}
          <div className="contact-info-section">
            <div className="contact-info-card">
              <h2 className="contact-info-title">Get in Touch</h2>
              <p className="contact-info-description">
                We're here to answer any questions you may have about Moon People. 
                Please log in to send us a message directly through our platform.
              </p>
              
              <div className="contact-details">
                <div className="contact-detail-item">
                  <div className="contact-detail-content">
                    <h3>Email</h3>
                    <p>info@moonpeople.org</p>
                  </div>
                </div>
                
                <div className="contact-detail-item">
                  <div className="contact-detail-content">
                    <h3>Phone</h3>
                    <p>+358 123 456 7890</p>
                  </div>
                </div>
                
                <div className="contact-detail-item">
                  <div className="contact-detail-content">
                    <h3>Location</h3>
                    <p>Tampere, Finland</p>
                  </div>
                </div>
              </div>
            </div>
            
        
          </div>
          
          {/* Login Prompt Section */}
          <div className="contact-login-prompt">
            <h2 className="contact-form-title">Send a Message</h2>
            
            <div className="contact-login-content">
              <h3 className="contact-login-title">Login Required</h3>
              <p className="contact-login-description">
                Please log in to your account to send us a message. This helps us track your conversations and provide better support.
              </p>
              
              <div className="contact-login-buttons">
                <Link to="/login" className="contact-login-button">
                  Login to Send Message
                </Link>
                
                <div className="contact-signup-text">
                  Don't have an account?{' '}
                  <Link to="/register" className="contact-signup-link">
                    Sign up here
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="contact-benefits">
              <p className="contact-benefits-title">
                <strong>Why login?</strong> When you're logged in, you can:
              </p>
              <ul className="contact-benefits-list">
                <li className="contact-benefits-item">Track your message status</li>
                <li className="contact-benefits-item">View our replies in your dashboard</li>
                <li className="contact-benefits-item">Access your message history</li>
                <li className="contact-benefits-item">Get faster support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show contact form for authenticated users
  return (
    <div className="contact-container">
      <h1 className="contact-title">Contact Us</h1>
      
      <div className="contact-grid">
        <div className="contact-info-section">
          <div className="contact-info-card">
            <h2 className="contact-info-title">Get in Touch</h2>
            <p className="contact-info-description">
              Hello {user?.name || user?.firstName || user?.email || 'there'}! We're here to answer any questions you may have about Moon People. 
              Send us a message and we'll respond as soon as we can.
            </p>
            
            <div className="contact-details">
              <div className="contact-detail-item">
                <div className="contact-detail-content">
                  <h3>Email</h3>
                  <p>info@moonpeople.org</p>
                </div>
              </div>
              
              <div className="contact-detail-item">
                <div className="contact-detail-content">
                  <h3>Phone</h3>
                  <p>+358 123 456 7890</p>
                </div>
              </div>
              
              <div className="contact-detail-item">
                <div className="contact-detail-content">
                  <h3>Location</h3>
                  <p>Tampere, Finland</p>
                </div>
              </div>
            </div>
            
            <div className="contact-user-info">
              <h4>Your Account</h4>
              <p>Logged in as: {user?.email}</p>
              <Link to="/user/messages">
                View your message history →
              </Link>
            </div>
          </div>
          
        
        </div>
        
        <div className="contact-form-section">
          <h2 className="contact-form-title">Send a Message</h2>
          
          {formStatus.submitted && (
            <div className={`contact-form-status ${formStatus.success ? 'success' : 'error'}`}>
              {formStatus.message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="contact-form-group">
              <label htmlFor="name" className="contact-form-label">Your Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={formStatus.loading}
                placeholder="Your full name"
                className="contact-form-input"
              />
            </div>
            
            <div className="contact-form-group">
              <label htmlFor="subject" className="contact-form-label">Subject</label>
              <input
                type="text"
                id="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                disabled={formStatus.loading}
                placeholder="What's this about?"
                className="contact-form-input"
              />
            </div>
            
            <div className="contact-form-group">
              <label htmlFor="message" className="contact-form-label">Message</label>
              <textarea
                id="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                disabled={formStatus.loading}
                placeholder="Tell us how we can help you..."
                className="contact-form-textarea"
              />
            </div>
            
            <button
              type="submit"
              disabled={formStatus.loading}
              className="contact-form-submit"
            >
              {formStatus.loading ? (
                <>
                  <div className="contact-loading-spinner"></div>
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;