// client/src/pages/CreateResource.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResourceForm from '../components/resources/ResourceForm';
import '../styles/ResourceCreate.css';
import { api } from '../services/api';
const { getCategories, createResource } = api;

const CreateResource = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories...');
        const response = await getCategories();
        console.log('Categories API response:', response);
        
        // The response might be structured differently
        // Try different possible structures
        let categoriesData = response;
        if (response.data) {
          categoriesData = response.data;
        } else if (response.categories) {
          categoriesData = response.categories;
        }
        
        console.log('Categories data to set:', categoriesData);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      }
    };

    fetchCategories();
  }, []);

  // Handle form submission
  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      await createResource(formData);
      
      setSubmitSuccess(true);
      
      // Redirect to admin resources page after a brief delay to show success message
      setTimeout(() => {
        navigate('/admin/resources');
      }, 1500);
    } catch (err) {
      console.error('Error creating resource:', err);
      setError(err.message || 'Failed to create resource. Please try again.');
      setSubmitSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel button - redirect to admin resources page
  const handleCancel = () => {
    navigate('/admin/resources');
  };

  return (
    <div className="create-resource-container">
      <div className="create-resource-header">
        <h1>Create New Resource</h1>
        <p>Share your knowledge by adding a new resource to our library.</p>
        <button className="cancel-button" onClick={handleCancel}>
          Cancel
        </button>
      </div>

      {submitSuccess ? (
        <div className="success-message">
          <p>Resource created successfully! Redirecting to resources management...</p>
        </div>
      ) : (
        <div className="create-resource-form-container">
          {error && (
            <div className="error-message form-error">
              <p>{error}</p>
            </div>
          )}
          
          <ResourceForm
            categories={categories}
            onSubmit={handleSubmit}
            submitButtonText={loading ? 'Creating...' : 'Create Resource'}
          />
          
          <div className="form-help-text">
            <p>
              Note: Your resource will be submitted for review. 
              Once approved by an administrator, it will be published to the resource library.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateResource;