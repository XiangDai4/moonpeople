// client/src/pages/PostDetail.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import '../styles/PostDetail.css';

const PostDetail = () => {
  const { postId } = useParams();
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [collapsedReplies, setCollapsedReplies] = useState(new Set());

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const collectRepliesWithChildren = (replies) => {
    const idsWithChildren = new Set();
    
    const traverse = (replyList) => {
      replyList.forEach(reply => {
        if (reply.children && reply.children.length > 0) {
          idsWithChildren.add(reply._id);
          traverse(reply.children);
        }
      });
    };
    
    traverse(replies);
    return idsWithChildren;
  };

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await api.getForumPostById(postId);
      setPost(response.post);
      setReplies(response.replies);
      
      const repliesWithChildren = collectRepliesWithChildren(response.replies);
      setCollapsedReplies(repliesWithChildren);
    } catch (error) {
      setError('Error loading post: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePostFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      const response = await api.togglePostFavorite(postId);
      setPost(prev => ({
        ...prev,
        favorites: response.favorited 
          ? [...(prev.favorites || []), user._id || user.id]
          : (prev.favorites || []).filter(id => id !== (user._id || user.id)),
        favoriteCount: response.favoriteCount || (response.favorited 
          ? (prev.favoriteCount || 0) + 1 
          : Math.max(0, (prev.favoriteCount || 0) - 1))
      }));
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('Failed to update favorite status');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content.substring(0, 200),
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

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!replyContent.trim()) {
      return;
    }
    
    try {
      setSubmittingReply(true);
      const replyData = {
        content: replyContent.trim(),
        parentReplyId: replyingTo?.id || null
      };
      
      await api.createForumReply(postId, replyData);
      await fetchPost();
      
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      setError('Error posting reply: ' + error.message);
    } finally {
      setSubmittingReply(false);
    }
  };

  const startReplyTo = (reply) => {
    setReplyingTo({
      id: reply._id,
      authorName: getAuthorName(reply)
    });
    document.getElementById('reply-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const toggleReplyCollapse = (replyId) => {
    setCollapsedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(replyId)) {
        newSet.delete(replyId);
      } else {
        newSet.add(replyId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const countNestedReplies = (replies) => {
    let count = replies?.length || 0;
    replies?.forEach(reply => {
      count += countNestedReplies(reply.children);
    });
    return count;
  };

  // Helper functions for favorites
  const isPostFavorited = () => {
    if (!isAuthenticated || !user || !post) return false;
    const userId = user._id || user.id;
    return post.favorites?.includes(userId) || false;
  };

  const getFavoriteCount = () => {
    return post?.favoriteCount || post?.favorites?.length || 0;
  };

  // Helper function to get author name safely
  const getAuthorName = (item) => {
    return item?.author?.fullName || 'Unknown Author';
  };

  const renderReplies = (replies, depth = 0) => {
    return replies.map(reply => {
      const isCollapsed = collapsedReplies.has(reply._id);
      const hasChildren = reply.children && reply.children.length > 0;
      const childrenCount = countNestedReplies(reply.children);
      
      return (
        <div key={reply._id} className={`reply depth-${Math.min(depth, 2)}`}>
          <div className="reply-content">
            <div className="reply-header">
              <div className="reply-meta">
                <span className="reply-author">{getAuthorName(reply)}</span>
                <span className="reply-date">{formatDate(reply.createdAt)}</span>
                {replyingTo?.id === reply._id && (
                  <span className="replying-indicator">← Replying to this</span>
                )}
              </div>
              
              {hasChildren && (
                <button
                  onClick={() => toggleReplyCollapse(reply._id)}
                  className="collapse-button"
                  title={isCollapsed ? 'Show replies' : 'Hide replies'}
                >
                  <span className="collapse-icon">
                    {isCollapsed ? '▶️' : '▼️'}
                  </span>
                  <span className="collapse-text">
                    {isCollapsed ? `Show ${childrenCount} replies` : 'Hide replies'}
                  </span>
                </button>
              )}
            </div>
            
            <div className="reply-text">
              {reply.content}
            </div>
            
            <div className="reply-actions">
              {isAuthenticated && !post.isLocked && (
                <button 
                  onClick={() => startReplyTo(reply)}
                  className={`reply-button ${replyingTo?.id === reply._id ? 'active' : ''}`}
                >
                  {replyingTo?.id === reply._id ? 'Cancel Reply' : 'Reply'}
                </button>
              )}
            </div>
          </div>
          
          {hasChildren && !isCollapsed && (
            <div className="nested-replies">
              {renderReplies(reply.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="post-detail-container">
        <div className="loading">Loading post...</div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="post-detail-container">
        <div className="error-message">{error}</div>
        <Link to="/forum" className="back-link">← Back to Forum</Link>
      </div>
    );
  }

  return (
    <div className="post-detail-container">
      <div className="breadcrumb">
        <Link to="/forum" className="breadcrumb-link">Forum</Link>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">{post.title}</span>
      </div>

      <article className="post-detail">
        <header className="post-header">
          <h1 className="post-title">{post.title}</h1>
          <div className="post-meta">
            <span className="post-author">by {getAuthorName(post)}</span>
            <span className="post-date">{formatDate(post.createdAt)}</span>
            <span className="post-views">{post.viewCount} views</span>
            {post.isLocked && <span className="locked-badge">🔒 Locked</span>}
          </div>
        </header>

        <div className="post-content">
          <p>{post.content}</p>
        </div>

        <div className="post-actions">
          <button
            onClick={handlePostFavorite}
            className={`action-button favorite-button ${
              isPostFavorited() ? 'favorited' : ''
            }`}
            title={isPostFavorited() ? "Remove from favorites" : "Add to favorites"}
          >
            <span className="action-icon">
              {isPostFavorited() ? '⭐️' : '✩'}
            </span>
            <span className="action-text">
              {isPostFavorited() ? 'Favorited' : 'Add to Favorites'}
            </span>
            <span className="action-count">({getFavoriteCount()})</span>
          </button>
          
          <button
            onClick={handleShare}
            className="action-button share-button"
          >
            <span className="action-icon">📤</span>
            <span className="action-text">Share</span>
          </button>
        </div>
      </article>

      <section className="replies-section">
        <div className="replies-header">
          <h2 className="replies-title">
            Replies ({post.replyCount})
          </h2>
          {replies.length > 0 && (
            <div className="replies-controls">
              <button
                onClick={() => setCollapsedReplies(new Set())}
                className="control-button"
              >
                Expand All
              </button>
              <button
                onClick={() => setCollapsedReplies(new Set(collectRepliesWithChildren(replies)))}
                className="control-button"
              >
                Collapse All
              </button>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {replies.length > 0 ? (
          <div className="replies-list">
            {renderReplies(replies)}
          </div>
        ) : (
          <div className="no-replies">
            <p>No replies yet. Be the first to join the conversation!</p>
          </div>
        )}

        {isAuthenticated && !post.isLocked ? (
          <form onSubmit={handleReplySubmit} className="reply-form" id="reply-form">
            {replyingTo && (
              <div className="replying-to">
                <span>💬 Replying to <strong>{replyingTo.authorName}</strong></span>
                <button type="button" onClick={cancelReply} className="cancel-reply">
                  ✕
                </button>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="replyContent" className="form-label">
                {replyingTo ? 'Your Reply' : 'Join the conversation'}
              </label>
              <textarea
                id="replyContent"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={replyingTo ? `Reply to ${replyingTo.authorName}...` : "Write your reply..."}
                className="reply-textarea"
                rows="4"
                required
              />
            </div>
            
            <div className="form-actions">
              <button
                type="submit"
                disabled={submittingReply || !replyContent.trim()}
                className="submit-reply-button"
              >
                {submittingReply ? 'Posting...' : (replyingTo ? 'Post Reply' : 'Post Comment')}
              </button>
              {replyingTo && (
                <button
                  type="button"
                  onClick={cancelReply}
                  className="cancel-button"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : post.isLocked ? (
          <div className="locked-message">
            <p>🔒 This post is locked and no longer accepting replies.</p>
          </div>
        ) : (
          <div className="login-prompt">
            <p>
              <Link to="/login">Login</Link> or <Link to="/register">register</Link> to join the conversation.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default PostDetail;