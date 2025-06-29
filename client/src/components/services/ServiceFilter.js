// client/src/components/services/ServiceFilter.js
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../../styles/ServiceFilter.css';
import api from '../../services/api';

const ServiceFilter = ({ onFilterChange }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    language: searchParams.get('language') || ''
  });
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories({ active: true });
        setCategories(data);
      } catch (err) {
        setError('Failed to load categories');
        console.error(err);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Fetch cities from services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const data = await api.getServices();
        
        // Extract unique cities
        const uniqueCities = [...new Set(data.map(service => service.location.city))];
        setCities(uniqueCities.sort());
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load services');
        console.error(err);
        setLoading(false);
      }
    };
    
    fetchServices();
  }, []);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    // Update filter state
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update URL params
    if (value) {
      searchParams.set(name, value);
    } else {
      searchParams.delete(name);
    }
    setSearchParams(searchParams);
    
    // Notify parent component
    onFilterChange({
      ...filters,
      [name]: value
    });
  };
  
  return (
    <div className="support-service-filter">
      <h2 className="support-service-filter__heading">Filter Services</h2>
      
      {loading ? (
        <p className="support-service-filter__loading">Loading filters...</p>
      ) : error ? (
        <p className="support-service-filter__error">{error}</p>
      ) : (
        <div className="support-service-filter__controls">
          <div className="support-service-filter__group">
            <label htmlFor="category" className="support-service-filter__label">Category</label>
            <select 
              id="category" 
              name="category" 
              value={filters.category} 
              onChange={handleFilterChange}
              className="support-service-filter__select"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="support-service-filter__group">
            <label htmlFor="city" className="support-service-filter__label">City</label>
            <select 
              id="city" 
              name="city" 
              value={filters.city} 
              onChange={handleFilterChange}
              className="support-service-filter__select"
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          
          <div className="support-service-filter__group">
            <label htmlFor="language" className="support-service-filter__label">Language</label>
            <select 
              id="language" 
              name="language" 
              value={filters.language} 
              onChange={handleFilterChange}
              className="support-service-filter__select"
            >
              <option value="">All Languages</option>
              <option value="English">English</option>
              <option value="Finnish">Finnish</option>
              <option value="Swedish">Swedish</option>
              <option value="Russian">Russian</option>
              <option value="Arabic">Arabic</option>
            </select>
          </div>
          
          <button 
            className="support-service-filter__clear-btn"
            onClick={() => {
              setFilters({
                category: '',
                city: '',
                language: ''
              });
              setSearchParams({});
              onFilterChange({
                category: '',
                city: '',
                language: ''
              });
            }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ServiceFilter;