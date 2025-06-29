// client/src/components/resources/ResourceCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/ResourceCard.css';

const ResourceCard = ({ resource }) => {
  // Add null check to prevent the error
  if (!resource) {
    return (
      <div className="resource-card resource-card--error">
        <p className="resource-card__error-text">Resource data not available</p>
      </div>
    );
  }

  const { _id, title, description, category, type, languages, createdBy, createdAt } = resource;
  
  // Format date with additional safety check
  const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString() : 'Unknown date';
  
  return (
    <div className="resource-card">
      <div className="resource-card__header">
        <span className={`resource-card__type resource-card__type--${type || 'unknown'}`}>
          {type || 'Unknown'}
        </span>
        <div className="resource-card__languages">
          {(languages || []).map(lang => (
            <span key={lang} className="resource-card__language-badge">{lang}</span>
          ))}
        </div>
      </div>
      
      <div className="resource-card__content">
        <h3 className="resource-card__title">{title || 'Untitled'}</h3>
        <p className="resource-card__category">{category?.name || 'Uncategorized'}</p>
        <p className="resource-card__description">{description || 'No description available'}</p>
      </div>
      
      <div className="resource-card__footer">
        <div className="resource-card__meta">
          <span className="resource-card__author">By: {createdBy?.fullName || 'Anonymous'}</span>
          <span className="resource-card__date">{formattedDate}</span>
        </div>
        {_id && (
          <Link to={`/resources/${_id}`} className="resource-card__link">
            <span>View Resource</span>
            <svg className="resource-card__link-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
};

export default ResourceCard;