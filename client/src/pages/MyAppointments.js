// client/src/pages/MyAppointments.js
import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import '../styles/MyAppointments.css';


const MyAppointments = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await api.getUserBookings(statusFilter);
      setAppointments(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load appointments');
      console.error(err);
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (bookingId) => {
    const reason = prompt('Please provide a reason for cancellation (optional):');
    
    if (reason !== null) { // User didn't click cancel
      try {
        await api.cancelBooking(bookingId, reason);
        alert('Appointment cancelled successfully');
        fetchAppointments(); // Refresh list
      } catch (err) {
        console.error('Error cancelling appointment:', err);
        alert('Failed to cancel appointment');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'confirmed' && new Date(apt.date) >= new Date()
  );

  const pastAppointments = appointments.filter(apt => 
    apt.status === 'completed' || 
    apt.status === 'cancelled' || 
    (apt.status === 'confirmed' && new Date(apt.date) < new Date())
  );

  if (loading) {
    return (
      <div className="appointments-container">
        <div className="loading-container">
          <p>Loading your appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="appointments-container">
        <div className="error-container">
          <p className="error-text">{error}</p>
          <button onClick={fetchAppointments} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h1>My Appointments</h1>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'confirmed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('confirmed')}
          >
            Upcoming
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setStatusFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="no-appointments">
          <p>No appointments found.</p>
          <a href="/services" className="browse-services-link">
            Browse Services to Book
          </a>
        </div>
      ) : (
        <div className="appointments-content">
          {/* Upcoming Appointments */}
          {statusFilter === 'all' && upcomingAppointments.length > 0 && (
            <div className="appointments-section">
              <h2>Upcoming Appointments</h2>
              <div className="appointments-list">
                {upcomingAppointments.map(appointment => (
                  <div key={appointment._id} className="appointment-card">
                    <div className="appointment-header">
                      <h3 className="service-name">{appointment.service.name}</h3>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(appointment.status) }}
                      >
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="appointment-details">
                      <div className="detail-item">
                        <strong>Date:</strong> {formatDate(appointment.date)}
                      </div>
                      <div className="detail-item">
                        <strong>Time:</strong> {appointment.timeSlot.startTime} - {appointment.timeSlot.endTime}
                      </div>
                      <div className="detail-item">
                        <strong>Volunteer:</strong> {appointment.volunteer.fullName}
                      </div>
                      <div className="detail-item">
                        <strong>Contact:</strong> {appointment.volunteer.email}
                      </div>
                      {appointment.notes && (
                        <div className="detail-item">
                          <strong>Notes:</strong> {appointment.notes}
                        </div>
                      )}
                    </div>

                    {appointment.status === 'confirmed' && (
                      <div className="appointment-actions">
                        <button 
                          onClick={() => handleCancelAppointment(appointment._id)}
                          className="cancel-button"
                        >
                          Cancel Appointment
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All appointments or filtered appointments */}
          {statusFilter !== 'all' && (
            <div className="appointments-section">
              <div className="appointments-list">
                {appointments.map(appointment => (
                  <div key={appointment._id} className="appointment-card">
                    <div className="appointment-header">
                      <h3 className="service-name">{appointment.service.name}</h3>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(appointment.status) }}
                      >
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="appointment-details">
                      <div className="detail-item">
                        <strong>Date:</strong> {formatDate(appointment.date)}
                      </div>
                      <div className="detail-item">
                        <strong>Time:</strong> {appointment.timeSlot.startTime} - {appointment.timeSlot.endTime}
                      </div>
                      <div className="detail-item">
                        <strong>Volunteer:</strong> {appointment.volunteer.fullName}
                      </div>
                      <div className="detail-item">
                        <strong>Contact:</strong> {appointment.volunteer.email}
                      </div>
                      {appointment.notes && (
                        <div className="detail-item">
                          <strong>Notes:</strong> {appointment.notes}
                        </div>
                      )}
                      {appointment.status === 'cancelled' && appointment.cancellationReason && (
                        <div className="detail-item">
                          <strong>Cancellation Reason:</strong> {appointment.cancellationReason}
                        </div>
                      )}
                    </div>

                    {appointment.status === 'confirmed' && new Date(appointment.date) >= new Date() && (
                      <div className="appointment-actions">
                        <button 
                          onClick={() => handleCancelAppointment(appointment._id)}
                          className="cancel-button"
                        >
                          Cancel Appointment
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Appointments */}
          {statusFilter === 'all' && pastAppointments.length > 0 && (
            <div className="appointments-section">
              <h2>Past Appointments</h2>
              <div className="appointments-list">
                {pastAppointments.map(appointment => (
                  <div key={appointment._id} className="appointment-card past">
                    <div className="appointment-header">
                      <h3 className="service-name">{appointment.service.name}</h3>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(appointment.status) }}
                      >
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="appointment-details">
                      <div className="detail-item">
                        <strong>Date:</strong> {formatDate(appointment.date)}
                      </div>
                      <div className="detail-item">
                        <strong>Time:</strong> {appointment.timeSlot.startTime} - {appointment.timeSlot.endTime}
                      </div>
                      <div className="detail-item">
                        <strong>Volunteer:</strong> {appointment.volunteer.fullName}
                      </div>
                      {appointment.status === 'cancelled' && appointment.cancellationReason && (
                        <div className="detail-item">
                          <strong>Cancellation Reason:</strong> {appointment.cancellationReason}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;