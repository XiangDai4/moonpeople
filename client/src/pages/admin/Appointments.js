// client/src/pages/admin/Appointments.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/admin/Appointments.css';


const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, currentPage]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await api.getAllBookings(statusFilter, currentPage, 20);
      setAppointments(data.bookings);
      setPagination(data.pagination);
      setLoading(false);
    } catch (err) {
      setError('Failed to load appointments');
      console.error(err);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#28a745';
      case 'cancelled': return '#dc3545';
      case 'completed': return '#6c757d';
      default: return '#007bff';
    }
  };

  const getStatusStats = () => {
    const stats = {
      total: appointments.length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length
    };
    return stats;
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading) {
    return (
      <div className="admin-appointments">
        <div className="loading-container">
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-appointments">
        <div className="error-container">
          <p className="error-text">{error}</p>
          <button onClick={fetchAppointments} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = getStatusStats();

  return (
    <div className="admin-appointments">
      <div className="appointments-header">
        <h1>Appointments Management</h1>
        <p>Overview of all system appointments</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Appointments</h3>
          <div className="stat-number">{pagination.total || 0}</div>
        </div>
        <div className="stat-card confirmed">
          <h3>Confirmed</h3>
          <div className="stat-number">{stats.confirmed}</div>
        </div>
        <div className="stat-card completed">
          <h3>Completed</h3>
          <div className="stat-number">{stats.completed}</div>
        </div>
        <div className="stat-card cancelled">
          <h3>Cancelled</h3>
          <div className="stat-number">{stats.cancelled}</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="filter-section">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => {
              setStatusFilter('all');
              setCurrentPage(1);
            }}
          >
            All Appointments
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'confirmed' ? 'active' : ''}`}
            onClick={() => {
              setStatusFilter('confirmed');
              setCurrentPage(1);
            }}
          >
            Confirmed
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => {
              setStatusFilter('completed');
              setCurrentPage(1);
            }}
          >
            Completed
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'cancelled' ? 'active' : ''}`}
            onClick={() => {
              setStatusFilter('cancelled');
              setCurrentPage(1);
            }}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Appointments Table */}
      {appointments.length === 0 ? (
        <div className="no-appointments">
          <p>No appointments found for the selected filter.</p>
        </div>
      ) : (
        <>
          <div className="appointments-table-container">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>User</th>
                  <th>Volunteer</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(appointment => (
                  <tr key={appointment._id}>
                    <td>
                      <div className="service-cell">
                        <strong>{appointment.service.name}</strong>
                      </div>
                    </td>
                    <td>
                      <div className="user-cell">
                        <div className="user-name">{appointment.user.fullName}</div>
                        <div className="user-email">{appointment.user.email}</div>
                      </div>
                    </td>
                    <td>
                      <div className="volunteer-cell">
                        <div className="volunteer-name">{appointment.volunteer.fullName}</div>
                        <div className="volunteer-email">{appointment.volunteer.email}</div>
                      </div>
                    </td>
                    <td>
                      <div className="datetime-cell">
                        <div className="date">{formatDate(appointment.date)}</div>
                        <div className="time">
                          {appointment.timeSlot.startTime} - {appointment.timeSlot.endTime}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ 
                          backgroundColor: getStatusColor(appointment.status),
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="created-cell">
                        {formatDateTime(appointment.createdAt)}
                      </div>
                    </td>
                    <td>
                      <div className="notes-cell">
                        {appointment.notes ? (
                          <span title={appointment.notes}>
                            {appointment.notes.length > 30 
                              ? appointment.notes.substring(0, 30) + '...'
                              : appointment.notes
                            }
                          </span>
                        ) : (
                          <span className="no-notes">-</span>
                        )}
                        {appointment.status === 'cancelled' && appointment.cancellationReason && (
                          <div className="cancellation-reason">
                            <strong>Cancelled:</strong> {appointment.cancellationReason}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="pagination-btn"
              >
                Previous
              </button>
              
              <div className="pagination-info">
                Page {currentPage} of {pagination.pages} 
                ({pagination.total} total appointments)
              </div>
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= pagination.pages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Appointments;