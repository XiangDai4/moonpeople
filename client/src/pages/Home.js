// client/src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css'; 

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-content">
          <h1 className="home-hero-title">Moon People</h1>
          <p className="home-hero-subtitle">
            A digital sanctuary for those navigating the complexities of cancer diagnoses and treatment.
          </p>
          
          <div className="home-cta-buttons">
            <Link 
              to="/need-support" 
              className="home-btn home-btn-primary"
            >
              I Need Support
            </Link>
            
            <Link 
              to="/want-to-support" 
              className="home-btn home-btn-secondary"
            >
              I Want to Support
            </Link>
          </div>
        </div>
      </section>
      
      {/* Mission Section */}
      <section className="home-mission">
        <div className="home-section-container">
          <h2 className="home-section-title">Our Mission</h2>
          <p className="home-mission-text">
            Our platform bridges the gap between those seeking support and those offering it, 
            creating a warm, accessible community where no one faces cancer alone. By connecting 
            patients with volunteers, resources, and peer support, we aim to transform the cancer 
            journey from one of isolation to one of connection and hope.
          </p>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="home-features">
        <div className="home-section-container">
          <h2 className="home-section-title">How We Help</h2>
          
          <div className="home-features-grid">
            <div className="home-feature-card">
              <div className="home-feature-icon">
                {/* You can add an icon here if needed */}
              </div>
              <h3 className="home-feature-title">Support Community</h3>
              <p className="home-feature-description">
                Connect with others who understand your journey and find emotional support in our community.
              </p>
            </div>
            
            <div className="home-feature-card">
              <div className="home-feature-icon">
                {/* You can add an icon here if needed */}
              </div>
              <h3 className="home-feature-title">Resource Library</h3>
              <p className="home-feature-description">
                Access reliable information, guides, and resources to help navigate your cancer journey.
              </p>
            </div>
            
            <div className="home-feature-card">
              <div className="home-feature-icon">
                {/* You can add an icon here if needed */}
              </div>
              <h3 className="home-feature-title">Support Services</h3>
              <p className="home-feature-description">
                Find local services like therapy, beauty treatments, and physical activities adapted to your needs.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="home-testimonials">
        <div className="home-section-container">
          <h2 className="home-section-title">Stories of Hope</h2>
          
          <div className="home-testimonial-card">
            <p className="home-testimonial-text">
              "Moon People connected me with services and volunteers who truly understood what I was going through. 
              For the first time since my diagnosis, I didn't feel alone."
            </p>
            <p className="home-testimonial-author">— Sarah, Cancer Survivor</p>
          </div>
        </div>
      </section>
      
      {/* Join Us Section */}
      <section className="home-join">
        <div className="home-section-container">
          <h2 className="home-section-title">Join Our Community</h2>
          <p className="home-join-text">
            Whether you're seeking support or want to offer it, Moon People is your community.
          </p>
          
          <div className="home-cta-buttons">
            <Link 
              to="/register" 
              className="home-btn home-btn-primary"
            >
              Create an Account
            </Link>
            
            <Link 
              to="/about" 
              className="home-btn home-btn-outline"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;