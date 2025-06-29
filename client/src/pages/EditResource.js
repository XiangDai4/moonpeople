// client/src/pages/EditResource.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ResourceForm from '../components/resources/ResourceForm';
import '../styles/ResourceEdit.css';
import { api } from '../services/api';
// FIX: Use the correct function names from api.js
const {getResourceById, getCategories, updateResource} = api;

const EditResource = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [resource, setResource] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  // Fetch resource and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        console.log('Starting to fetch data...');
        
        // FIX: Use correct function name and fetch them separately for better debugging
        const resourceResponse = await getResourceById(id);
        console.log('Resource response:', resourceResponse);
        
        const categoriesResponse = await getCategories();
        console.log('Categories response:', categoriesResponse);
        console.log('Categories data:', categoriesResponse.data);
        console.log('Full categories response structure:', JSON.stringify(categoriesResponse, null, 2));
        
        const fetchedResource = resourceResponse.data;
        
        // Check authorization - only resource creator or admin can edit
        if (user && (user.role === 'admin' || fetchedResource.createdBy._id === user.id)) {
          setResource(fetchedResource);
          
          // Handle different possible response structures
          let categoriesData;
          if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
            categoriesData = categoriesResponse.data;
          } else if (Array.isArray(categoriesResponse)) {
            categoriesData = categoriesResponse;
          } else {
            console.error('Unexpected categories response format:', categoriesResponse);
            categoriesData = [];
          }
          
          console.log('Setting categories to:', categoriesData);
          setCategories(categoriesData);
        } else {
          setUnauthorized(true);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        console.error('Error details:', err.message);
        setError('Failed to load resource data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [id, user]);

  // Handle form submission
  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      setError(null);
      
      await updateResource(id, formData);
      
      setSubmitSuccess(true);
      
      // Redirect to admin resources page after a brief delay to show success message
      setTimeout(() => {
        navigate('/admin/resources');
      }, 1500);
    } catch (err) {
      console.error('Error updating resource:', err);
      setError(err.message || 'Failed to update resource. Please try again.');
      setSubmitSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel button - redirect to admin resources page
  const handleCancel = () => {
    navigate('/admin/resources');
  };

  if (unauthorized) {
    return (
      <div className="edit-resource-container">
        <div className="unauthorized-message">
          <h2>Unauthorized</h2>
          <p>You do not have permission to edit this resource.</p>
          <button onClick={() => navigate('/admin/resources')}>
            Return to Resources Management
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-resource-container">
      <div className="edit-resource-header">
        <h1>Edit Resource</h1>
        <button className="cancel-button" onClick={handleCancel}>
          Cancel
        </button>
      </div>

      {loading ? (
        <div className="loading-message">Loading resource data...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : submitSuccess ? (
        <div className="success-message">
          <p>Resource updated successfully! Redirecting...</p>
        </div>
      ) : resource ? (
        <div className="edit-resource-form-container">
          <ResourceForm
            categories={categories || []}
            initialData={resource}
            onSubmit={handleSubmit}
            submitButtonText={submitting ? 'Saving...' : 'Save Changes'}
          />
        </div>
      ) : (
        <div className="not-found-message">
          <p>Resource not found</p>
          <button onClick={() => navigate('/admin/resources')}>
            Return to Resources Management
          </button>
        </div>
      )}
    </div>
  );
};

export default EditResource;