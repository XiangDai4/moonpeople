// client/src/pages/ForumList.js
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import '../styles/ForumList.css';

const ForumList = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPosts();
  }, [currentPage, activeSearch]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = { 
        page: currentPage,
        limit: 20
      };
      
      if (activeSearch.trim()) {
        params.search = activeSearch.trim();
      }
      
      const response = await api.getForumPosts(params);
      setPosts(response.posts);
      setPagination(response.pagination);
    } catch (error) {
      setError('Error loading forum posts: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setActiveSearch(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setActiveSearch('');
    setCurrentPage(1);
  };

  const handlePostFavorite = async (postId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      const response = await api.togglePostFavorite(postId);
      
      // Update the post in the list based on API response
      setPosts(posts.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              favorites: response.favorited 
                ? [...(post.favorites || []), user._id || user.id]
                : (post.favorites || []).filter(id => id !== (user._id || user.id)),
              favoriteCount: response.favoriteCount || (response.favorited 
                ? (post.favoriteCount || 0) + 1 
                : Math.max(0, (post.favoriteCount || 0) - 1))
            }
          : post
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('Failed to update favorite status');
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

  // Helper function to check if user has favorited a post
  const isPostFavorited = (post) => {
    if (!isAuthenticated || !user) return false;
    const userId = user._id || user.id;
    return post.favorites?.includes(userId) || false;
  };

  // Helper function to get favorite count
  const getFavoriteCount = (post) => {
    return post.favoriteCount || post.favorites?.length || 0;
  };

  // Helper function to get author name safely
  const getAuthorName = (post) => {
    return post.author?.fullName || 'Unknown Author';
  };

  if (loading) {
    return (
      <div className="forum-page">
        <div className="forum-loading">Loading forum posts...</div>
      </div>
    );
  }

  return (
    <div className="forum-page">
      <div className="forum-header">
        <h1>Community Forum</h1>
        <p>Connect with others, share experiences, and get support from our community.</p>
        
        <div className="forum-actions">
          <form onSubmit={handleSearch} className="forum-search-form">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="forum-search-input"
            />
            <button type="submit" className="forum-search-btn">Search</button>
            {activeSearch && (
              <button 
                type="button" 
                onClick={handleClearSearch}
                className="forum-clear-search-btn"
              >
                Clear
              </button>
            )}
          </form>
          
          {isAuthenticated ? (
            <>
              <Link to="/forum/new-post" className="forum-new-post-btn">
                <span className="forum-plus-icon">+</span>
                New Post
              </Link>
              <Link to="/forum/favorites" className="forum-favorites-link">
                My Favorites
              </Link>
            </>
          ) : (
            <Link to="/login" className="forum-login-prompt">
              Login to Post
            </Link>
          )}
        </div>
      </div>

      {error && <div className="forum-error">{error}</div>}

      {activeSearch && (
        <div className="forum-search-indicator">
          <p>Showing results for: "<strong>{activeSearch}</strong>"</p>
        </div>
      )}

      <div className="forum-posts-list">
        {posts.length === 0 ? (
          <div className="forum-no-posts">
            <h3>No posts found</h3>
            <p>
              {activeSearch 
                ? 'Try adjusting your search terms.' 
                : 'Be the first to start a conversation!'
              }
            </p>
            {isAuthenticated && (
              <Link to="/forum/new-post" className="forum-new-post-btn">
                Create First Post
              </Link>
            )}
          </div>
        ) : (
          posts.map(post => (
            <Link 
              key={post._id} 
              to={`/forum/posts/${post._id}`} 
              className="forum-post-card"
            >
              <div className="forum-post-header">
                <h3 className="forum-post-title">{post.title}</h3>
                <div className="forum-post-meta">
                  <span className="forum-post-author">by {getAuthorName(post)}</span>
                  <span className="forum-post-date">{formatDate(post.lastActivity)}</span>
                  {post.isLocked && <span className="forum-locked-badge">🔒 Locked</span>}
                </div>
              </div>
              
              <div className="forum-post-content">
                <div className="forum-post-preview">
                  {post.content ? (
                    <p className="forum-post-content-preview">
                      {post.content.length > 300 
                        ? post.content.substring(0, 300) + '...' 
                        : post.content
                      }
                    </p>
                  ) : (
                    <p className="forum-post-excerpt">{post.excerpt}</p>
                  )}
                </div>
              </div>
              
              <div className="forum-post-stats">
                <div className="forum-stats-left">
                  <span className="forum-stat">
                    <span className="forum-stat-icon">💬</span>
                    {post.replyCount} replies
                  </span>
                </div>
                
                <div className="forum-post-actions">
                  <button
                    onClick={(e) => handlePostFavorite(post._id, e)}
                    className={`forum-action-btn forum-favorite-btn ${
                      isPostFavorited(post) ? 'favorited' : ''
                    }`}
                    title={isPostFavorited(post) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <span className="forum-action-icon">
                      {isPostFavorited(post) ? '⭐️' : '✩'}
                    </span>
                    <span className="forum-action-count">{getFavoriteCount(post)}</span>
                  </button>
                  
                  <button
                    onClick={(e) => handleShare(post, e)}
                    className="forum-action-btn forum-share-btn"
                    title="Share post"
                  >
                    <span className="forum-action-icon">📤</span>
                    Share
                  </button>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="forum-pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="forum-pagination-btn"
          >
            Previous
          </button>
          
          <span className="forum-pagination-info">
            Page {currentPage} of {pagination.pages}
          </span>
          
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === pagination.pages}
            className="forum-pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ForumList;