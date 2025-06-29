// client/src/pages/UserFavorites.js
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import '../styles/UserFavorites.css'; 

const UserFavorites = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // Handle authentication check in useEffect
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [currentPage, isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.getUserFavorites({ 
        page: currentPage,
        limit: 20
      });
      setPosts(response.posts);
      setPagination(response.pagination);
    } catch (error) {
      setError('Error loading favorite posts: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (postId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await api.togglePostFavorite(postId);
      // Remove the post from the favorites list
      setPosts(posts.filter(post => post._id !== postId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleShare = async (post, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = `${window.location.origin}/forum/posts/${post._id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: url
        });
      } catch (error) {
        // User cancelled the share
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Helper function to get author display name
  const getAuthorName = (author) => {
    if (!author) {
      return 'Unknown Author';
    }
    return author.fullName || author.username || 'Anonymous';
  };

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="forum-container">
        <div className="loading">Loading your favorite posts...</div>
      </div>
    );
  }

  return (
    <div className="forum-container">
      <div className="forum-header">
        <h1>My Favorite Posts</h1>
        <p>Posts you've saved for later reading.</p>
        
 
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="posts-list">
        {posts.length === 0 ? (
          <div className="no-posts">
            <h3>No favorite posts yet</h3>
            <p>When you favorite posts, they'll appear here for easy access.</p>
            <Link to="/forum" className="new-post-button">
              Browse Forum
            </Link>
          </div>
        ) : (
          posts.map(post => (
            <Link 
              key={post._id} 
              to={`/forum/posts/${post._id}`} 
              className="post-card"
            >
              <div className="post-header">
                <h3 className="post-title">{post.title}</h3>
                <div className="post-meta">
                  <span className="post-author">by {getAuthorName(post.author)}</span>
                  <span className="post-date">{formatDate(post.lastActivity)}</span>
                  {post.isLocked && <span className="locked-badge">🔒 Locked</span>}
                </div>
              </div>
              
              <div className="post-content">
                <p className="post-excerpt">{post.excerpt}</p>
              </div>
              
              <div className="post-stats">
                <div className="stats-left">
        
                  <span className="stat">
                    <span className="stat-icon">💬</span>
                    {post.replyCount} replies
                  </span>
                </div>
                
                <div className="post-actions">
                  <button
                    onClick={(e) => handleRemoveFavorite(post._id, e)}
                    className="action-button favorite-button favorited"
                    title="Remove from favorites"
                  >
                    <span className="action-icon">⭐️</span>
                    Remove
                  </button>
                  
                  <button
                    onClick={(e) => handleShare(post, e)}
                    className="action-button share-button"
                    title="Share post"
                  >
                    <span className="action-icon">🔗</span>
                    Share
                  </button>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {currentPage} of {pagination.pages}
          </span>
          
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === pagination.pages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UserFavorites;