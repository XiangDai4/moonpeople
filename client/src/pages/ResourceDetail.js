// client/src/pages/ResourceDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/ResourceDetail.css';
import { api } from '../services/api';
// FIX: Use the correct function name from api.js
const {getResourceById} = api;

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        // FIX: Use correct function name
        const response = await getResourceById(id);
        setResource(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching resource:', err);
        setError('Failed to load resource. It may not exist or you may not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id]);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Return to library
  const handleBackClick = () => {
    navigate('/resources');
  };

  // Check if user is author or admin
  const isAuthorOrAdmin = resource && 
    user && 
  (user.role === 'admin' || (resource.createdBy && resource.createdBy._id === user.id));

  return (
    <div className="resource-detail-container">
      {loading ? (
        <div className="loading-message">Loading resource...</div>
      ) : error ? (
        <div className="error-container">
          <div className="error-message">{error}</div>
          <button className="back-button" onClick={handleBackClick}>
            Return to Resource Library
          </button>
        </div>
      ) : resource ? (
        <>
          <div className="resource-detail-header">
            <button className="back-button" onClick={handleBackClick}>
              ← Back to Library
            </button>
            
            <div className="resource-meta">
              <div className="resource-type-badges">
                <span className={`resource-type ${resource.type}`}>
                  {resource.type === 'article' ? 'Article' : 'External Link'}
                </span>
                {resource.languages.map(lang => (
                  <span key={lang} className="language-badge">{lang}</span>
                ))}
              </div>
              
              <div className="resource-category">
                <span>Category: </span>
                <span className="category-name">{resource.category?.name || 'Uncategorized'}</span>
              </div>
            </div>
            
            <h1 className="resource-title">{resource.title}</h1>
            
            <div className="resource-author-info">
              <span>By {resource.createdBy?.fullName || 'Anonymous'}</span>
              <span className="resource-date">{formatDate(resource.createdAt)}</span>
            </div>
            
            {isAuthorOrAdmin && (
              <div className="resource-actions">
                <Link to={`/resources/edit/${resource._id}`} className="edit-resource-btn">
                  Edit Resource
                </Link>
              </div>
            )}
          </div>
          

<div className="resource-detail-content">
  <div className="resource-description">
    <p>{resource.description}</p>
  </div>
  
  {resource.type === 'article' ? (
    <div className="resource-article-content">
      {/* Safe access to content.text with null checks */}
      {resource.content?.text ? (
        resource.content.text.split('\n').map((paragraph, idx) => (
          paragraph ? <p key={idx}>{paragraph}</p> : <br key={idx} />
        ))
      ) : (
        <p>No content available for this article.</p>
      )}
    </div>
  ) : (
    <div className="resource-link-content">
      <p>This resource is available at an external link:</p>
      {resource.content?.externalLink ? (
        <>
          <a 
            href={resource.content.externalLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="external-resource-link"
          >
            {resource.content.externalLink}
          </a>
          <p className="external-link-disclaimer">
            Note: External links will open in a new tab. Moon People is not responsible for the content of external sites.
          </p>
        </>
      ) : (
        <p>External link not available for this resource.</p>
      )}
    </div>
  )}
</div>
        </>
      ) : (
        <div className="not-found-message">
          <p>Resource not found</p>
          <button className="back-button" onClick={handleBackClick}>
            Return to Resource Library
          </button>
        </div>
      )}
    </div>
  );
};

export default ResourceDetail;