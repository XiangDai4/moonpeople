// client/src/pages/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotFound.css';

const NotFound = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <div className="notfound-icon">
          <span className="error-code">404</span>
        </div>
        
        <h1 className="notfound-title">Page Not Found</h1>
        
        <p className="notfound-message">
          We can help with many things, but finding this page isn't one of them.
        </p>
        
        <p className="notfound-submessage">
          The page you're looking for might have been moved, deleted, or doesn't exist.
        </p>
        
        <div className="notfound-actions">
          <Link to="/" className="cta-button primary">
            Go Back Home
          </Link>
          
          <Link to="/services" className="cta-button outline">
            Browse Services
          </Link>
        </div>
        
        <div className="notfound-help">
          <p>Need help finding something?</p>
          <Link to="/contact" className="help-link">
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;