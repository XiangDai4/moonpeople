import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NeedSupport.css';

const NeedSupport = () => {
  return (
    <div className="need-support-page">
      <section className="need-support-hero">
        <div className="need-support-hero-content">
          <h1>How Can We Support You?</h1>
          <p>
            We're here to help you navigate your cancer journey with compassion and care.
          </p>
        </div>
      </section>
      
      <section className="need-support-options">
        <div className="need-support-section-container">
          <h2 className="need-support-section-title">Support Options</h2>
          
          <div className="need-support-options-grid">
            <div className="need-support-option-card">
              <h3 className="need-support-option-title">Support Services</h3>
              <p className="need-support-option-description">
                Find local services including counseling, beauty services, exercise programs, and more.
              </p>
              <Link to="/services" className="need-support-option-btn">
                Browse Services
              </Link>
            </div>
            
            <div className="need-support-option-card">
              <h3 className="need-support-option-title">Resource Library</h3>
              <p className="need-support-option-description">
                Access helpful articles, guides, and information to help navigate your cancer journey.
              </p>
              <Link to="/resources" className="need-support-option-btn">
                Explore Resources
              </Link>
            </div>
            
            <div className="need-support-option-card">
              <h3 className="need-support-option-title">Community Forum</h3>
              <p className="need-support-option-description">
                Connect with others who understand your journey and share experiences in our supportive community.
              </p>
              <Link to="/forum" className="need-support-option-btn">
                Join Discussions
              </Link>
            </div>
            
            <div className="need-support-option-card">
              <h3 className="need-support-option-title">Book Appointments</h3>
              <p className="need-support-option-description">
                Schedule appointments with service providers for personal support tailored to your needs.
              </p>
              <Link to="/services" className="need-support-option-btn">
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <section className="need-support-featured">
        <div className="need-support-section-container">
          <h2 className="need-support-section-title">Featured Support Services</h2>
          <p className="need-support-section-description">
            Explore our most popular support services to find the help you need.
          </p>
          
          <Link to="/services" className="need-support-browse-btn">
            Browse All Services
          </Link>
        </div>
      </section>
      
      <section className="need-support-cta">
        <div className="need-support-section-container">
          <h2 className="need-support-section-title">Need Help Finding Support?</h2>
          <p className="need-support-section-description">
            Our team is here to help you find the right resources and services for your unique situation.
          </p>
          
          <Link to="/contact" className="need-support-contact-btn">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
};

export default NeedSupport;