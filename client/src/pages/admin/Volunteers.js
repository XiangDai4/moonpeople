// client/src/pages/admin/Volunteers.js
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import '../../styles/admin/Volunteers.css';

const AdminVolunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({
    status: 'pending',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [volunteerToReject, setVolunteerToReject] = useState(null);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchVolunteers();
    }
  }, [user, filters]);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/volunteers/admin/profiles?${params}`);
      setVolunteers(response.profiles || []);
      setPagination(response.pagination || {});
    } catch (error) {
      setError('Error fetching volunteers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (volunteerId) => {
    try {
      await api.put(`/volunteers/admin/profiles/${volunteerId}/approve`);
      await fetchVolunteers();
      setSelectedVolunteer(null);
      setShowDetails(false);
    } catch (error) {
      setError('Error approving volunteer: ' + error.message);
    }
  };

  const handleRejectClick = (volunteer) => {
    setVolunteerToReject(volunteer);
    setShowRejectModal(true);
    setRejectReason('');
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      await api.put(`/volunteers/admin/profiles/${volunteerToReject._id}/reject`, {
        reason: rejectReason
      });
      await fetchVolunteers();
      setShowRejectModal(false);
      setVolunteerToReject(null);
      setRejectReason('');
      setSelectedVolunteer(null);
      setShowDetails(false);
    } catch (error) {
      setError('Error rejecting volunteer: ' + error.message);
    }
  };

  const handleViewDetails = async (volunteer) => {
    try {
      const response = await api.get(`/volunteers/admin/profiles/${volunteer._id}`);
      setSelectedVolunteer(response);
      setShowDetails(true);
    } catch (error) {
      setError('Error fetching volunteer details: ' + error.message);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (volunteer) => {
    if (volunteer.isApproved) return 'approved';
    if (volunteer.rejectionReason) return 'rejected';
    return 'pending';
  };

  const getStatusText = (volunteer) => {
    if (volunteer.isApproved) return 'Approved';
    if (volunteer.rejectionReason) return 'Rejected';
    return 'Pending Review';
  };

  if (user?.role !== 'admin') {
    return (
      <div className="admin-volunteers-page">
        <div className="error-message">Access denied. Admin privileges required.</div>
      </div>
    );
  }

  return (
    <div className="admin-volunteers-page">
      <div className="page-header">
        <h1>Volunteer Management</h1>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Status:</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Per Page:</label>
          <select
            name="limit"
            value={filters.limit}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Volunteers List */}
      <div className="volunteers-section">
        {loading ? (
          <div className="loading">Loading volunteers...</div>
        ) : volunteers.length === 0 ? (
          <div className="no-volunteers">
            <h3>No volunteers found</h3>
            <p>No volunteer applications match the current filters.</p>
          </div>
        ) : (
          <>
            <div className="volunteers-table">
              <div className="volunteers-table-header">
                <div className="volunteers-header-cell">Volunteer</div>
                <div className="volunteers-header-cell">Applied</div>
                <div className="volunteers-header-cell">Status</div>
                <div className="volunteers-header-cell">Time Commitment</div>
                <div className="volunteers-header-cell">Actions</div>
              </div>

              {volunteers.map(volunteer => (
                <div key={volunteer._id} className="table-row">
                  <div className="cell volunteer-info">
                    <div className="volunteer-name">{volunteer.user?.fullName}</div>
                    <div className="volunteer-email">{volunteer.user?.email}</div>
                    <div className="volunteer-city">{volunteer.user?.city}</div>
                  </div>

                  <div className="cell">
                    {formatDate(volunteer.createdAt)}
                  </div>

                  <div className="cell">
                    <span className={`volunteer-status-badge ${getStatusColor(volunteer)}`}>
                      {getStatusText(volunteer)}
                    </span>
                  </div>

                  <div className="cell">
                    {volunteer.timeCommitment}
                  </div>

                  <div className="cell actions">
                    <button
                      onClick={() => handleViewDetails(volunteer)}
                      className="volunteer-btn volunteer-btn-view"
                    >
                      View Details
                    </button>

                    {!volunteer.isApproved && !volunteer.rejectionReason && (
                      <>
                        <button
                          onClick={() => handleApprove(volunteer._id)}
                          className="volunteer-btn volunteer-btn-approve"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectClick(volunteer)}
                          className="volunteer-btn volunteer-btn-reject"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="pagination-button"
                >
                  Previous
                </button>

                <div className="pagination-info">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="pagination-button"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Volunteer Details Modal */}
      {showDetails && selectedVolunteer && (
        <div className="modal-overlay">
          <div className="modal-content volunteer-details">
            <div className="modal-header">
              <h2>Volunteer Application Details</h2>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedVolunteer(null);
                }}
                className="close-button"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>Personal Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Name:</strong> {selectedVolunteer.user?.fullName}
                  </div>
                  <div className="detail-item">
                    <strong>Email:</strong> {selectedVolunteer.user?.email}
                  </div>
                  <div className="detail-item">
                    <strong>City:</strong> {selectedVolunteer.user?.city}
                  </div>
                  <div className="detail-item">
                    <strong>Applied:</strong> {formatDate(selectedVolunteer.createdAt)}
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Availability & Commitment</h3>
                <div className="detail-item">
                  <strong>Time Commitment:</strong> {selectedVolunteer.timeCommitment}
                </div>
                <div className="detail-item">
                  <strong>Availability:</strong>
                  <p>{selectedVolunteer.availability}</p>
                </div>
                <div className="detail-item">
                  <strong>Preferred Contact:</strong> {selectedVolunteer.preferredContactMethod}
                </div>
              </div>

              {selectedVolunteer.skills && selectedVolunteer.skills.length > 0 && (
                <div className="detail-section">
                  <h3>Skills</h3>
                  <div className="skills-list">
                    {selectedVolunteer.skills.map(skill => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedVolunteer.interests && selectedVolunteer.interests.length > 0 && (
                <div className="detail-section">
                  <h3>Interests</h3>
                  <div className="interests-list">
                    {selectedVolunteer.interests.map(interest => (
                      <span key={interest} className="interest-tag">{interest}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedVolunteer.motivation && (
                <div className="detail-section">
                  <h3>Motivation</h3>
                  <p>{selectedVolunteer.motivation}</p>
                </div>
              )}

              {selectedVolunteer.experience && (
                <div className="detail-section">
                  <h3>Relevant Experience</h3>
                  <p>{selectedVolunteer.experience}</p>
                </div>
              )}

              {selectedVolunteer.previousVolunteerWork && (
                <div className="detail-section">
                  <h3>Previous Volunteer Work</h3>
                  <p>{selectedVolunteer.previousVolunteerWork}</p>
                </div>
              )}

              {selectedVolunteer.rejectionReason && (
                <div className="detail-section rejection">
                  <h3>Rejection Reason</h3>
                  <p>{selectedVolunteer.rejectionReason}</p>
                </div>
              )}

              {selectedVolunteer.isApproved && selectedVolunteer.approvedAt && (
                <div className="detail-section approval">
                  <h3>Approval Information</h3>
                  <p>Approved on {formatDate(selectedVolunteer.approvedAt)}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {!selectedVolunteer.isApproved && !selectedVolunteer.rejectionReason && (
                <>
                  <button
                    onClick={() => handleApprove(selectedVolunteer._id)}
                    className="volunteer-btn volunteer-btn-approve"
                  >
                    Approve Volunteer
                  </button>
                  <button
                    onClick={() => handleRejectClick(selectedVolunteer)}
                    className="volunteer-btn volunteer-btn-reject"
                  >
                    Reject Application
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedVolunteer(null);
                }}
                className="volunteer-btn volunteer-btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content reject-modal">
            <div className="modal-header">
              <h2>Reject Volunteer Application</h2>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setVolunteerToReject(null);
                  setRejectReason('');
                }}
                className="volunteer-btn volunteer-btn-secondary"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <p>Please provide a reason for rejecting this volunteer application:</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows="4"
                className="reject-reason-input"
              />
            </div>

            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setVolunteerToReject(null);
                  setRejectReason('');
                }}
                className="action-button secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                className="volunteer-btn volunteer-btn-reject"
                disabled={!rejectReason.trim()}
              >
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVolunteers;