import React, { useState, useEffect } from 'react';
import '../../styles/ResourceFilter.css';

const ResourceFilter = ({ categories, onFilterChange }) => {
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    language: '',
    search: ''
  });

  // Available resource types
  const resourceTypes = [
    { value: 'article', label: 'Articles' },
    { value: 'link', label: 'External Links' }
  ];

  // Available languages (can be expanded)
  const languages = [
    { value: 'English', label: 'English' },
    { value: 'Finnish', label: 'Finnish' }
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    onFilterChange(filters);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      type: '',
      language: '',
      search: ''
    });
    
    // Also trigger the parent component to clear filters
    onFilterChange({
      category: '',
      type: '',
      language: '',
      search: ''
    });
  };

  // Send filters to parent when they change
  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange(filters);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [filters.search]);

  return (
    <div className="resource-filter">
      <div className="resource-filter__header">
        <h3 className="resource-filter__title">Filter Resources</h3>
      </div>
      
      <div className="resource-filter__search">
        <input
          type="text"
          name="search"
          placeholder="Search resources..."
          value={filters.search}
          onChange={handleChange}
          className="resource-filter__search-input"
        />
        <svg className="resource-filter__search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      <div className="resource-filter__section">
        <label className="resource-filter__label">Category</label>
        <select 
          name="category" 
          value={filters.category} 
          onChange={handleChange}
          className="resource-filter__select"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="resource-filter__section">
        <label className="resource-filter__label">Resource Type</label>
        <select 
          name="type" 
          value={filters.type} 
          onChange={handleChange}
          className="resource-filter__select"
        >
          <option value="">All Types</option>
          {resourceTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="resource-filter__section">
        <label className="resource-filter__label">Language</label>
        <select 
          name="language" 
          value={filters.language} 
          onChange={handleChange}
          className="resource-filter__select"
        >
          <option value="">All Languages</option>
          {languages.map(lang => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="resource-filter__actions">
        <button 
          className="resource-filter__apply-btn" 
          onClick={applyFilters}
        >
          Apply Filters
        </button>
        <button 
          className="resource-filter__clear-btn" 
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default ResourceFilter;