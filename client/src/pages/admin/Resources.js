// client/src/pages/admin/Resources.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/admin/Resources.css';
import { api} from '../../services/api';
// FIX: Use the correct function names from api.js
const {getAdminResources, deleteResource, toggleResourcePublishStatus} = api;

const AdminResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [actionInProgress, setActionInProgress] = useState(null);

  // Fetch resources on mount
  useEffect(() => {
    fetchResources();
  }, []);

  // Fetch resources from API
  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await getAdminResources();
      setResources(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to load resources. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete resource
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      try {
        setActionInProgress(id);
        await deleteResource(id);
        
        // Update resources list
        setResources(prevResources => 
          prevResources.filter(resource => resource._id !== id)
        );
      } catch (err) {
        console.error('Error deleting resource:', err);
        alert('Failed to delete resource. Please try again.');
      } finally {
        setActionInProgress(null);
      }
    }
  };

  // Handle toggle publish status
  const handleTogglePublish = async (id, currentStatus) => {
    try {
      setActionInProgress(id);
      // FIX: Use correct function name and pass the opposite of current status
      await toggleResourcePublishStatus(id, !currentStatus);
      
      // Update resource status in list
      setResources(prevResources => 
        prevResources.map(resource => 
          resource._id === id 
            ? { ...resource, isPublished: !resource.isPublished } 
            : resource
        )
      );
    } catch (err) {
      console.error('Error toggling publish status:', err);
      alert('Failed to update resource status. Please try again.');
    } finally {
      setActionInProgress(null);
    }
  };

  // Filter resources based on current filters
  const filteredResources = resources.filter(resource => {
    // Filter by status
    if (filterStatus === 'published' && !resource.isPublished) return false;
    if (filterStatus === 'unpublished' && resource.isPublished) return false;
    
    // Filter by type
    if (filterType !== 'all' && resource.type !== filterType) return false;
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        resource.title.toLowerCase().includes(searchLower) ||
        resource.description.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Render action buttons for both table and cards
  const renderActionButtons = (resource, isMobile = false) => {
    const containerClass = isMobile ? 'resource-card-actions' : 'action-buttons';
    
    return (
      <div className={containerClass}>
        <Link 
          to={`/resources/edit/${resource._id}`} 
          className="edit-btn"
        >
          Edit
        </Link>
        
        <button 
          className={`publish-toggle-btn ${resource.isPublished ? 'unpublish' : 'publish'}`}
          onClick={() => handleTogglePublish(resource._id, resource.isPublished)}
          disabled={actionInProgress === resource._id}
        >
          {actionInProgress === resource._id 
            ? 'Updating...' 
            : resource.isPublished ? 'Unpublish' : 'Publish'}
        </button>
        
        <button 
          className="delete-btn"
          onClick={() => handleDelete(resource._id)}
          disabled={actionInProgress === resource._id}
        >
          {actionInProgress === resource._id ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    );
  };

  // Render mobile card layout
  const renderMobileCards = () => {
    return (
      <div className="admin-resources-cards">
        {filteredResources.map(resource => (
          <div key={resource._id} className={`resource-card ${!resource.isPublished ? 'unpublished' : ''}`}>
            <div className="resource-card-header">
              <div className="resource-card-title">
                <Link to={`/resources/${resource._id}`}>
                  {resource.title}
                </Link>
              </div>
              <span className={`status-badge ${resource.isPublished ? 'published' : 'unpublished'}`}>
                {resource.isPublished ? 'Published' : 'Unpublished'}
              </span>
            </div>
            
            <div className="resource-card-meta">
              <div className="resource-card-meta-item">
                <div className="resource-card-meta-label">Type</div>
                <div className="resource-card-meta-value">
                  {resource.type === 'article' ? 'Article' : 'Link'}
                </div>
              </div>
              
              <div className="resource-card-meta-item">
                <div className="resource-card-meta-label">Category</div>
                <div className="resource-card-meta-value">
                  {resource.category?.name || 'Uncategorized'}
                </div>
              </div>
              
              <div className="resource-card-meta-item">
                <div className="resource-card-meta-label">Author</div>
                <div className="resource-card-meta-value">
                  {resource.createdBy?.fullName || 'Unknown'}
                </div>
              </div>
              
              <div className="resource-card-meta-item">
                <div className="resource-card-meta-label">Created</div>
                <div className="resource-card-meta-value">
                  {formatDate(resource.createdAt)}
                </div>
              </div>
            </div>
            
            {renderActionButtons(resource, true)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="admin-resources-container">
      <div className="admin-resources-header">
        <h1>Manage Resources</h1>
        <Link to="/resources/create" className="create-resource-btn">
          Add New Resource
        </Link>
      </div>
      
      <div className="admin-resources-filters">
        <div className="filter-group">
          <label htmlFor="status-filter">Status:</label>
          <select 
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="type-filter">Type:</label>
          <select 
            id="type-filter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="article">Articles</option>
            <option value="link">External Links</option>
          </select>
        </div>
        
        <div className="filter-group search-group">
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="loading-message">Loading resources...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : filteredResources.length === 0 ? (
        <div className="no-resources-message">
          <p>No resources found matching the current filters.</p>
          <button onClick={() => {
            setFilterStatus('all');
            setFilterType('all');
            setSearch('');
          }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="admin-resources-table-container">
            <table className="admin-resources-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.map(resource => (
                  <tr key={resource._id} className={!resource.isPublished ? 'unpublished' : ''}>
                    <td className="resource-title-cell">
                      <Link to={`/resources/${resource._id}`}>
                        {resource.title}
                      </Link>
                    </td>
                    <td>{resource.type === 'article' ? 'Article' : 'Link'}</td>
                    <td>{resource.category?.name || 'Uncategorized'}</td>
                    <td>{resource.createdBy?.fullName || 'Unknown'}</td>
                    <td>{formatDate(resource.createdAt)}</td>
                    <td>
                      <span className={`status-badge ${resource.isPublished ? 'published' : 'unpublished'}`}>
                        {resource.isPublished ? 'Published' : 'Unpublished'}
                      </span>
                    </td>
                    <td className="action-cell">
                      {renderActionButtons(resource, false)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Mobile Card View */}
          {renderMobileCards()}
        </>
      )}
    </div>
  );
};

export default AdminResources;