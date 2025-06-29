// client/src/pages/ServiceDetail.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import '../styles/ServiceDetail.css';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useContext(AuthContext);
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [volunteerProfile, setVolunteerProfile] = useState(null);
  const [isOfferingService, setIsOfferingService] = useState(false);
  
  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const data = await api.getServiceById(id);
        setService(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load service details');
        console.error(err);
        setLoading(false);
      }
    };
    
    fetchService();
  }, [id]);

  // Check if volunteer is already offering this service
  useEffect(() => {
    const checkVolunteerStatus = async () => {
      if (user && user.role === 'volunteer') {
        try {
          const profile = await api.getMyVolunteerProfile();
          setVolunteerProfile(profile);
          
          // Check if already offering this service
          const isOffering = profile.servicesOffered.some(
            service => service._id === id
          );
          setIsOfferingService(isOffering);
        } catch (err) {
          console.error('Error fetching volunteer profile:', err);
        }
      }
    };

    if (service) {
      checkVolunteerStatus();
    }
  }, [user, service, id]);

  const handleApplyToOfferService = async () => {
    if (!user || user.role !== 'volunteer') {
      alert('You must be an approved volunteer to offer services');
      return;
    }

    try {
      setIsApplying(true);
      await api.applyToOfferService(id);
      setIsOfferingService(true);
      alert('Successfully applied to offer this service!');
    } catch (err) {
      console.error('Error applying to offer service:', err);
      alert(err.response?.data?.message || 'Failed to apply for service');
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveOfferedService = async () => {
    if (window.confirm('Are you sure you want to stop offering this service?')) {
      try {
        setIsApplying(true);
        await api.removeOfferedService(id);
        setIsOfferingService(false);
        alert('Service removed from your offered services');
      } catch (err) {
        console.error('Error removing offered service:', err);
        alert('Failed to remove service');
      } finally {
        setIsApplying(false);
      }
    }
  };

  const handleBookService = () => {
    if (!user) {
      alert('Please log in to book a service');
      navigate('/login');
      return;
    }
    
    // Navigate to booking page with service ID
    navigate(`/book-service/${id}`);
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await api.deleteService(id);
        navigate('/services');
      } catch (err) {
        console.error('Error deleting service:', err);
        alert('Failed to delete service');
      }
    }
  };
  
  if (loading) {
    return (
      <div className="service-detail-container">
        <div className="loading-container">
          <p className="loading-text">Loading service details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !service) {
    return (
      <div className="service-detail-container">
        <div className="error-container">
          <p className="error-text">{error || 'Service not found'}</p>
          <Link to="/services" className="back-button">Back to Services</Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="service-detail-container">
      <div className="service-detail-header">
        <Link to="/services" className="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" className="back-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Services
        </Link>
        
        <h1 className="service-title">{service.name}</h1>
        
        {service.category && (
          <div className="service-category-badge">
            {service.category.name}
          </div>
        )}
      </div>
      
      <div className="service-detail-content">
        <div className="service-info-panel">
          <div className="info-group">
            <h2 className="info-title">Provider</h2>
            <p className="provider-name">{service.provider}</p>
          </div>
          
          <div className="info-group">
            <h2 className="info-title">Location</h2>
            <p className="location-text">{service.location.city}</p>
          </div>
          
          {service.contact && (
            <div className="info-group">
              <h2 className="info-title">Contact</h2>
              {service.contact.email && (
                <p className="contact-item">
                  <svg xmlns="http://www.w3.org/2000/svg" className="contact-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${service.contact.email}`}>{service.contact.email}</a>
                </p>
              )}
              {service.contact.phone && (
                <p className="contact-item">
                  <svg xmlns="http://www.w3.org/2000/svg" className="contact-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${service.contact.phone}`}>{service.contact.phone}</a>
                </p>
              )}
            </div>
          )}
          
          {service.languages && service.languages.length > 0 && (
            <div className="info-group">
              <h2 className="info-title">Languages</h2>
              <div className="languages-list">
                {service.languages.map(language => (
                  <span key={language} className="language-badge">
                    {language}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="action-buttons">
            {/* Regular user - Book service button */}
            {user && user.role === 'user' && (
              <button onClick={handleBookService} className="book-button">
                Book This Service
              </button>
            )}

            {/* Volunteer - Apply to offer service button */}
            {user && user.role === 'volunteer' && (
              <>
                {!isOfferingService ? (
                  <button 
                    onClick={handleApplyToOfferService} 
                    disabled={isApplying}
                    className="apply-button"
                  >
                    {isApplying ? 'Applying...' : 'Offer This Service'}
                  </button>
                ) : (
                  <button 
                    onClick={handleRemoveOfferedService} 
                    disabled={isApplying}
                    className="remove-service-button"
                  >
                    {isApplying ? 'Removing...' : 'Stop Offering This Service'}
                  </button>
                )}
              </>
            )}

            {/* Admin buttons */}
            {isAdmin && (
              <>
                <Link to={`/admin/services/edit/${service._id}`} className="edit-button">
                  Edit Service
                </Link>
                <button onClick={handleDelete} className="delete-button">
                  Delete Service
                </button>
              </>
            )}

            {/* Not logged in */}
            {!user && (
              <div className="login-prompt">
                <Link to="/login" className="login-link">
                  Log in to book this service
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="service-description-panel">
          <h2 className="description-title">About This Service</h2>
          <div className="description-content">
            <p>{service.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;