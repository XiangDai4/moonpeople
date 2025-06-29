import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ResourceCard from '../components/resources/ResourceCard';
import ResourceFilter from '../components/resources/ResourceFilter';
import '../styles/ResourceLibrary.css';
import {api} from '../services/api';
const {getResources, getCategories} = api;

const ResourceLibrary = () => {
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    language: '',
    search: ''
  });

  // Fetch categories and resources on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching resources and categories...');
        
        const [resourcesResponse, categoriesResponse] = await Promise.all([
          getResources(),
          getCategories()
        ]);
        
        console.log('Resources API response:', resourcesResponse);
        console.log('Categories API response:', categoriesResponse);
        
        // Handle different possible response structures
        let resourcesData = resourcesResponse;
        if (resourcesResponse.data) {
          resourcesData = resourcesResponse.data;
        } else if (resourcesResponse.resources) {
          resourcesData = resourcesResponse.resources;
        }
        
        let categoriesData = categoriesResponse;
        if (categoriesResponse.data) {
          categoriesData = categoriesResponse.data;
        } else if (categoriesResponse.categories) {
          categoriesData = categoriesResponse.categories;
        }
        
        console.log('Resources data to set:', resourcesData);
        console.log('Categories data to set:', categoriesData);
        
        setResources(Array.isArray(resourcesData) ? resourcesData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load resources. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters when they change
  const handleFilterChange = async (newFilters) => {
    try {
      setLoading(true);
      setFilters(newFilters);
      
      console.log('Applying filters:', newFilters);
      const response = await getResources(newFilters);
      console.log('Filtered resources response:', response);
      
      // Handle different possible response structures
      let resourcesData = response;
      if (response.data) {
        resourcesData = response.data;
      } else if (response.resources) {
        resourcesData = response.resources;
      }
      
      setResources(Array.isArray(resourcesData) ? resourcesData : []);
      setError(null);
    } catch (err) {
      console.error('Error applying filters:', err);
      setError('Failed to filter resources. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Organize resources by category for display
  const groupedResources = resources.reduce((acc, resource) => {
    const categoryId = resource.category?._id || 'uncategorized';
    const categoryName = resource.category?.name || 'Uncategorized';
    
    if (!acc[categoryId]) {
      acc[categoryId] = {
        name: categoryName,
        resources: []
      };
    }
    
    acc[categoryId].resources.push(resource);
    return acc;
  }, {});

  return (
    <div className="resource-library-container">
      <div className="resource-library-header">
        <h1>Resource Library</h1>
        <p>Browse our collection of articles and resources to help you on your journey.</p>
      </div>

      <div className="resource-library-content">
        <aside className="resource-sidebar">
          <ResourceFilter 
            categories={categories} 
            onFilterChange={handleFilterChange} 
          />
        </aside>

        <main className="resource-main">
          {loading ? (
            <div className="loading-message">Loading resources...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : resources.length === 0 ? (
            <div className="no-results-message">
              <p>No resources found matching your criteria.</p>
              <button onClick={() => handleFilterChange({
                category: '',
                type: '',
                language: '',
                search: ''
              })}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="resource-grid">
              {Object.values(groupedResources).map((group) => (
                <div key={group.name} className="resource-category-group">
                  <div className="resource-category-header">
                    <h2>{group.name}</h2>
                    <div className="resource-count">
                      {group.resources.length} {group.resources.length === 1 ? 'Resource' : 'Resources'}
                    </div>
                  </div>
                  <div className="resource-cards">
                    {group.resources.map(resource => (
                      <ResourceCard key={resource._id} resource={resource} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ResourceLibrary;