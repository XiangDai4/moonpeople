import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import '../styles/UserMessages.css';

const UserMessages = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [volunteerProfile, setVolunteerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [forumReplies, setForumReplies] = useState([]);
  const [activeTab, setActiveTab] = useState('messages');
  const [repliesPage, setRepliesPage] = useState(1);
  const [repliesTotalPages, setRepliesTotalPages] = useState(1);
  const [repliesLoading, setRepliesLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserMessages();
      loadVolunteerProfile();
      if (activeTab === 'replies') {
        loadForumReplies();
      }
    }
  }, [user, currentPage, repliesPage, activeTab]);

  const loadUserMessages = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 10 };
      const response = await api.getUserMessages(params);
      setMessages(response.data.messages);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error loading user messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVolunteerProfile = async () => {
    try {
      const response = await api.get('/volunteers/profile/me');
      setVolunteerProfile(response);
    } catch (error) {
      if (!error.message.includes('not found')) {
        console.error('Error loading volunteer profile:', error);
      }
    }
  };

  const loadForumReplies = async () => {
    try {
      setRepliesLoading(true);
      const response = await api.getUserForumReplies({
        page: repliesPage,
        limit: 10
      });
      setForumReplies(response.data.replies);
      setRepliesTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error loading forum replies:', error);
    } finally {
      setRepliesLoading(false);
    }
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { class: 'user-msg-status-new', text: 'Sent' },
      read: { class: 'user-msg-status-read', text: 'Read' },
      replied: { class: 'user-msg-status-replied', text: 'Replied' }
    };
    
    const config = statusConfig[status] || statusConfig.new;
    
    return (
      <span className={`user-msg-status-badge ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const getVolunteerStatusBadge = () => {
    if (!volunteerProfile) return null;

    if (volunteerProfile.isApproved) {
      return <span className="user-msg-status-badge user-msg-status-approved">Approved Volunteer</span>;
    } else if (volunteerProfile.rejectionReason) {
      return <span className="user-msg-status-badge user-msg-status-rejected">Application Rejected</span>;
    } else {
      return <span className="user-msg-status-badge user-msg-status-pending">Application Pending</span>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="user-messages-page">
        <div className="user-msg-access-denied">
          <h1>Access Required</h1>
          <p>Please log in to view your messages.</p>
          <Link to="/login" className="btn btn-primary">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (loading && activeTab === 'messages') {
    return (
      <div className="user-messages-page">
        <div className="user-msg-loading">
          <div className="loading-spinner"></div>
          <div>Loading messages...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-messages-page">
      <div className="container">
        

        {/* Volunteer Status Section */}
        {volunteerProfile && (
          <div className="card user-msg-volunteer-status">
            <div className="card-header">
              <h2>Volunteer Application Status</h2>
              {getVolunteerStatusBadge()}
            </div>
            
            <div className="user-msg-status-content">
              {volunteerProfile.isApproved ? (
                <div className="user-msg-status-approved-content">
                  <h3>🎉 Congratulations! You're now an approved volunteer!</h3>
                  <p>You can now apply to volunteer opportunities and help make a difference.</p>
                  <p>Approved on: {formatDate(volunteerProfile.approvedAt)}</p>
                  <div className="user-msg-status-actions">
                    <Link to="/opportunities" className="btn btn-primary">
                      View Opportunities
                    </Link>
                    <Link to="/volunteer-profile" className="btn btn-outline">
                      Manage Profile
                    </Link>
                  </div>
                </div>
              ) : volunteerProfile.rejectionReason ? (
                <div className="user-msg-status-rejected-content">
                  <h3>Application Update</h3>
                  <p>Your volunteer application was not approved at this time.</p>
                  <div className="user-msg-rejection-box">
                    <strong>Reason:</strong>
                    <p>{volunteerProfile.rejectionReason}</p>
                  </div>
                  <p>You can update your application and reapply.</p>
                  <Link to="/volunteer-registration" className="btn btn-primary">
                    Update Application
                  </Link>
                </div>
              ) : (
                <div className="user-msg-status-pending-content">
                  <h3>⏳ Application Under Review</h3>
                  <p>Your volunteer application is being reviewed by our team. We'll notify you here once a decision is made.</p>
                  <p>Applied on: {formatDate(volunteerProfile.createdAt)}</p>
                  <Link to="/volunteer-profile" className="btn btn-outline">
                    View Application Details
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="user-msg-tabs">
          <button
            className={`user-msg-tab ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            Messages ({messages.length})
          </button>
          <button
            className={`user-msg-tab ${activeTab === 'replies' ? 'active' : ''}`}
            onClick={() => setActiveTab('replies')}
          >
            Forum Replies {forumReplies.length > 0 && `(${forumReplies.length})`}
          </button>
        </div>

        {/* Messages Section */}
        {activeTab === 'messages' ? (
          <div className="user-msg-messages-section">
            {messages.length === 0 ? (
              <div className="user-msg-empty-state">
                <h3>No Messages</h3>
                                <p>You haven't sent any messages yet. Have a question or need support?</p>
                <Link to="/contact" className="btn btn-primary">
                  Contact Support
                </Link>
              </div>
            ) : (
              <div className="user-msg-layout">
                {/* Messages List */}
                <div className="card user-msg-list">
                  <div className="card-header">
                    <h3>Messages ({messages.length})</h3>
                  </div>
                  
                  <div className="user-msg-scroll">
                    {messages.map((message) => (
                      <div
                        key={message._id}
                        className={`user-msg-item ${
                          selectedMessage?._id === message._id ? 'selected' : ''
                        }`}
                        onClick={() => handleViewMessage(message)}
                      >
                        <div className="user-msg-item-header">
                          <h4 className="user-msg-subject">{message.subject}</h4>
                          {getStatusBadge(message.status)}
                        </div>
                        
                        <p className="user-msg-preview">
                          {message.message.substring(0, 120)}
                          {message.message.length > 120 ? '...' : ''}
                        </p>
                        
                        <div className="user-msg-item-footer">
                          <span className="user-msg-date">
                            {formatDate(message.createdAt)}
                          </span>
                          {message.status === 'replied' && (
                            <span className="user-msg-reply-indicator">
                              Reply received
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="user-msg-pagination">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="btn btn-outline"
                      >
                        Previous
                      </button>
                      <span className="user-msg-pagination-info">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="btn btn-outline"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>

                {/* Message Detail */}
                <div className="card user-msg-detail">
                  {selectedMessage ? (
                    <div className="user-msg-detail-content">
                      <div className="user-msg-detail-header">
                        <div className="user-msg-detail-title-section">
                          <h3 className="user-msg-detail-title">{selectedMessage.subject}</h3>
                          {getStatusBadge(selectedMessage.status)}
                        </div>
                        <p className="user-msg-detail-date">
                          Sent: {formatDate(selectedMessage.createdAt)}
                        </p>
                      </div>

                      <div className="user-msg-content-section">
                        <h4 className="user-msg-section-title">Your Message</h4>
                        <div className="user-msg-bubble user-msg-bubble-user">
                          <p>{selectedMessage.message}</p>
                        </div>
                      </div>

                      {selectedMessage.reply ? (
                        <div className="user-msg-content-section">
                          <h4 className="user-msg-section-title">Support Reply</h4>
                          <div className="user-msg-bubble user-msg-bubble-support">
                            <p>{selectedMessage.reply}</p>
                            <div className="user-msg-reply-timestamp">
                              Replied: {formatDate(selectedMessage.repliedAt)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="user-msg-status-message">
                          <p>
                            {selectedMessage.status === 'read' 
                              ? "Your message has been read. We'll respond soon."
                              : "Your message is being reviewed by our support team."
                            }
                          </p>
                        </div>
                      )}

                      {selectedMessage.status !== 'replied' && (
                        <div className="user-msg-follow-up">
                          <p>Need to add more information?</p>
                          <Link to="/contact" className="btn btn-outline">
                            Send Another Message
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="user-msg-no-selection">
                      <p>Select a message to view details</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Forum Replies Section */
          <div className="user-msg-replies-section">
            <div className="user-msg-section-header">
              <h2>Direct Replies to Your Posts & Comments</h2>
            </div>

            {repliesLoading ? (
              <div className="user-msg-loading">
                <div className="loading-spinner"></div>
                <div>Loading replies...</div>
              </div>
            ) : forumReplies.length === 0 ? (
              <div className="user-msg-empty-state">
                <h3>No Replies Yet</h3>
                <p>When someone replies directly to your posts or comments, they'll appear here.</p>
                <Link to="/forum" className="btn btn-primary">
                  Visit Forum
                </Link>
              </div>
            ) : (
              <div className="user-msg-replies-list">
                {forumReplies.map((reply) => (
                  <div key={reply._id} className="card user-msg-reply-card">
                    <div className="user-msg-reply-header">
                      <span className="user-msg-replier-name">{reply.author.fullName}</span>
                      <span className="user-msg-reply-time">{formatDate(reply.createdAt)}</span>
                    </div>
                    
                    <div className="user-msg-reply-context">
                      <p className="user-msg-reply-context-text">
                        Replied to your {reply.replyingTo.type} in:
                      </p>
                      <Link 
                        to={`/forum/post/${reply.post._id}`} 
                        className="user-msg-post-link"
                      >
                        {reply.post.title}
                      </Link>
                      
                      {reply.replyingTo.type === 'comment' && (
                        <div className="user-msg-original-comment">
                          <p className="user-msg-original-label">Your comment:</p>
                          <p className="user-msg-original-text">{reply.replyingTo.content}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="user-msg-reply-content">
                      <p>{reply.content}</p>
                    </div>
                    
                    <Link 
                      to={`/forum/post/${reply.post._id}#reply-${reply._id}`} 
                      className="user-msg-view-reply-btn"
                    >
                      View in Context →
                    </Link>
                  </div>
                ))}
                
                {/* Pagination for replies */}
                {repliesTotalPages > 1 && (
                  <div className="user-msg-pagination">
                    <button
                      onClick={() => setRepliesPage(Math.max(1, repliesPage - 1))}
                      disabled={repliesPage === 1}
                      className="btn btn-outline"
                    >
                      Previous
                    </button>
                    <span className="user-msg-pagination-info">
                      Page {repliesPage} of {repliesTotalPages}
                    </span>
                    <button
                      onClick={() => setRepliesPage(Math.min(repliesTotalPages, repliesPage + 1))}
                      disabled={repliesPage === repliesTotalPages}
                      className="btn btn-outline"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMessages;