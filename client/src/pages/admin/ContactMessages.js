// client/src/pages/admin/ContactMessages.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/admin/ContactMessages.css';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadMessages();
  }, [statusFilter, currentPage]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10
      };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await api.getContactMessages(params);
      setMessages(response.data.messages);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    if (message.status === 'new') {
      await api.markContactMessageAsRead(message._id);
      // Update local state
      setMessages(messages.map(m => 
        m._id === message._id ? { ...m, status: 'read' } : m
      ));
    }
  };

  const handleReply = async (messageId) => {
    if (!replyText.trim()) return;

    try {
      await api.replyToContactMessage(messageId, replyText);
      setReplyText('');
      setSelectedMessage(null);
      loadMessages(); // Refresh the list
      alert('Reply sent successfully!');
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Error sending reply');
    }
  };

  const handleDelete = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await api.deleteContactMessage(messageId);
        loadMessages();
        setSelectedMessage(null);
      } catch (error) {
        console.error('Error deleting message:', error);
        alert('Error deleting message');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = `cm-status-${status}`;
    
    return (
      <span className={`cm-status-badge ${statusClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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

  if (loading) {
    return (
      <div className="cm-loading-spinner">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="contact-messages-container">
      <div className="contact-messages-header">
        <h1 className="contact-messages-title">Contact Messages</h1>
      </div>

      {/* Filters */}
      <div className="cm-filters-section">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="cm-filter-select"
        >
          <option value="all">All Messages</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
        </select>
      </div>

      <div className="cm-messages-grid">
        {/* Messages List */}
        <div className="cm-messages-panel">
          <div className="cm-messages-panel-header">
            <h2 className="cm-messages-panel-title">
              Messages ({messages.length})
            </h2>
          </div>
          
          <div className="cm-messages-list">
            {messages.length === 0 ? (
              <div className="cm-empty-state">
                <p>No messages found</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message._id}
                  className={`cm-contact-message-item ${
                    selectedMessage?._id === message._id ? 'selected' : ''
                  }`}
                  onClick={() => handleViewMessage(message)}
                >
                  <div className="cm-contact-message-header">
                    <div className="cm-contact-message-sender">
                      <h3 className="cm-contact-message-name">{message.name}</h3>
                      <p className="cm-contact-message-email">{message.email}</p>
                    </div>
                    {getStatusBadge(message.status)}
                  </div>
                  
                  <h4 className="cm-contact-message-subject">{message.subject}</h4>
                  <p className="cm-contact-message-date">
                    {formatDate(message.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="cm-pagination">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="cm-pagination-button"
              >
                Previous
              </button>
              <span className="cm-pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="cm-pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="cm-detail-panel">
          {selectedMessage ? (
            <div className="cm-detail-content">
              <div className="cm-detail-header">
                <div>
                  <h2 className="cm-detail-title">{selectedMessage.subject}</h2>
                  <div className="cm-detail-meta">
                    <p>From: {selectedMessage.name} ({selectedMessage.email})</p>
                    <p>{formatDate(selectedMessage.createdAt)}</p>
                  </div>
                </div>
                {getStatusBadge(selectedMessage.status)}
              </div>

              <div className="cm-message-content">
                <label className="cm-content-label">Message:</label>
                <div className="cm-content-box">
                  <p className="cm-content-text">{selectedMessage.message}</p>
                </div>
              </div>

              {selectedMessage.reply && (
                <div className="cm-message-content">
                  <label className="cm-content-label">Your Reply:</label>
                  <div className="cm-content-box cm-reply-box">
                    <p className="cm-content-text">{selectedMessage.reply}</p>
                    <p className="message-date" style={{ marginTop: '0.5rem' }}>
                      Replied on {formatDate(selectedMessage.repliedAt)}
                    </p>
                  </div>
                </div>
              )}

              {selectedMessage.status !== 'replied' && (
                <div className="cm-reply-section">
                  <label className="cm-content-label">Send Reply:</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    className="cm-reply-textarea"
                  />
                  <div className="cm-contact-message-button-group">
                    <button
                      onClick={() => handleReply(selectedMessage._id)}
                      disabled={!replyText.trim()}
                      className="cm-contact-message-button primary"
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              )}

              <div className="cm-contact-message-button-group">
                <button
                  onClick={() => handleDelete(selectedMessage._id)}
                  className="cm-contact-message-button danger"
                >
                  Delete Message
                </button>
              </div>
            </div>
          ) : (
            <div className="cm-detail-empty-state">
              <p>Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactMessages;