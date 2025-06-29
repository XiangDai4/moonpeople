// client/src/components/resources/ResourceForm.js
import React, { useState, useEffect } from 'react';
import '../../styles/ResourceForm.css';

const ResourceForm = ({ categories, initialData, onSubmit, submitButtonText = 'Submit' }) => {
  // Debug: Check if categories are being passed
  console.log('Categories prop:', categories);
  console.log('Categories length:', categories ? categories.length : 'undefined');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: 'article',
    content: {
      text: '',
      externalLink: ''
    },
    languages: ['English']
  });
  
  const [errors, setErrors] = useState({});
  
  // If editing, populate form with initial data
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category?._id || initialData.category || '',
        type: initialData.type || 'article',
        content: {
          text: initialData.content?.text || '',
          externalLink: initialData.content?.externalLink || ''
        },
        languages: initialData.languages || ['English']
      });
    }
  }, [initialData]);
  
  // Available languages
  const availableLanguages = [
    { value: 'English', label: 'English' },
    { value: 'Finnish', label: 'Finnish' }
  ];
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'content.text' || name === 'content.externalLink') {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Handle language checkbox changes
  const handleLanguageChange = (lang) => {
    const currentLanguages = [...formData.languages];
    
    if (currentLanguages.includes(lang)) {
      // Remove language if already selected
      setFormData({
        ...formData,
        languages: currentLanguages.filter(l => l !== lang)
      });
    } else {
      // Add language if not selected
      setFormData({
        ...formData,
        languages: [...currentLanguages, lang]
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (formData.type === 'article' && !formData.content.text.trim()) {
      newErrors['content.text'] = 'Content is required for articles';
    }
    
    if (formData.type === 'link' && !formData.content.externalLink.trim()) {
      newErrors['content.externalLink'] = 'External link is required';
    }
    
    if (formData.languages.length === 0) {
      newErrors.languages = 'At least one language must be selected';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <form className="resource-form" onSubmit={handleSubmit}>
      <div className="resource-form__group">
        <label htmlFor="title" className="resource-form__label">
          Title <span className="resource-form__required">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`resource-form__input ${errors.title ? 'resource-form__input--error' : ''}`}
          placeholder="Enter resource title"
        />
        {errors.title && <div className="resource-form__error">{errors.title}</div>}
      </div>
      
      <div className="resource-form__group">
        <label htmlFor="description" className="resource-form__label">
          Description <span className="resource-form__required">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className={`resource-form__textarea ${errors.description ? 'resource-form__textarea--error' : ''}`}
          placeholder="Provide a brief description of the resource"
        ></textarea>
        {errors.description && <div className="resource-form__error">{errors.description}</div>}
      </div>
      
      <div className="resource-form__group">
        <label htmlFor="category" className="resource-form__label">
          Category <span className="resource-form__required">*</span>
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`resource-form__select ${errors.category ? 'resource-form__select--error' : ''}`}
        >
          <option value="">Select a category</option>
          {console.log('Rendering categories:', categories)}
          {(categories || []).map(category => {
            console.log('Rendering category:', category);
            return (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            );
          })}
        </select>
        {errors.category && <div className="resource-form__error">{errors.category}</div>}
      </div>
      
      <div className="resource-form__group">
        <label htmlFor="type" className="resource-form__label">
          Resource Type <span className="resource-form__required">*</span>
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="resource-form__select"
        >
          <option value="article">Article</option>
          <option value="link">External Link</option>
        </select>
        <div className="resource-form__help-text">
          {formData.type === 'article' 
            ? 'Create an article with content stored in our system' 
            : 'Link to an external resource or website'
          }
        </div>
      </div>
      
      {formData.type === 'article' && (
        <div className="resource-form__group">
          <label htmlFor="content.text" className="resource-form__label">
            Article Content <span className="resource-form__required">*</span>
          </label>
          <textarea
            id="content.text"
            name="content.text"
            value={formData.content.text}
            onChange={handleChange}
            rows="10"
            className={`resource-form__textarea resource-form__textarea--large ${errors['content.text'] ? 'resource-form__textarea--error' : ''}`}
            placeholder="Write your article content here..."
          ></textarea>
          {errors['content.text'] && <div className="resource-form__error">{errors['content.text']}</div>}
        </div>
      )}
      
      {formData.type === 'link' && (
        <div className="resource-form__group">
          <label htmlFor="content.externalLink" className="resource-form__label">
            External Link URL <span className="resource-form__required">*</span>
          </label>
          <input
            type="url"
            id="content.externalLink"
            name="content.externalLink"
            value={formData.content.externalLink}
            onChange={handleChange}
            placeholder="https://example.com"
            className={`resource-form__input ${errors['content.externalLink'] ? 'resource-form__input--error' : ''}`}
          />
          {errors['content.externalLink'] && <div className="resource-form__error">{errors['content.externalLink']}</div>}
        </div>
      )}
      
      <div className="resource-form__group">
        <label className="resource-form__label">
          Languages <span className="resource-form__required">*</span>
        </label>
        <div className="resource-form__checkboxes">
          {availableLanguages.map(lang => (
            <div key={lang.value} className="resource-form__checkbox">
              <input
                type="checkbox"
                id={`lang-${lang.value}`}
                checked={formData.languages.includes(lang.value)}
                onChange={() => handleLanguageChange(lang.value)}
                className="resource-form__checkbox-input"
              />
              <label htmlFor={`lang-${lang.value}`} className="resource-form__checkbox-label">
                {lang.label}
              </label>
            </div>
          ))}
        </div>
        {errors.languages && <div className="resource-form__error">{errors.languages}</div>}
      </div>
      
      <div className="resource-form__actions">
        <button type="submit" className="resource-form__submit">
          {submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default ResourceForm;