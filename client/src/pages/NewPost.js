// client/src/pages/NewPost.js
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import '../styles/NewPost.css';

const NewPost = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Both title and content are required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await api.createForumPost({
        title: formData.title.trim(),
        content: formData.content.trim()
      });
      
      // Redirect to the newly created post
      navigate(`/forum/posts/${response._id}`);
    } catch (error) {
      setError('Error creating post: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (formData.title.trim() || formData.content.trim()) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!confirmLeave) return;
    }
    navigate('/forum');
  };

  return (
    <div className="new-post-container">
      <div className="breadcrumb">
        <Link to="/forum" className="breadcrumb-link">Forum</Link>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">New Post</span>
      </div>

      <div className="new-post-card">
        <header className="new-post-header">
          <h1>Create New Post</h1>
          <p>Share your thoughts, ask questions, or start a discussion with the community.</p>
        </header>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="new-post-form">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Post Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter a descriptive title for your post..."
              className="form-input"
              maxLength="200"
              required
            />
            <div className="character-count">
              {formData.title.length}/200 characters
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="content" className="form-label">
              Post Content <span className="required">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your post content here... Be clear, respectful, and helpful to build a supportive community."
              className="form-textarea"
              rows="12"
              maxLength="10000"
              required
            />
            <div className="character-count">
              {formData.content.length}/10,000 characters
            </div>
          </div>

         

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading || !formData.title.trim() || !formData.content.trim()}
            >
              {loading ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>

  
    </div>
  );
};

export default NewPost;