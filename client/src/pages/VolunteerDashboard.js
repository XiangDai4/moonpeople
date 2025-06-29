// client/src/pages/VolunteerDashboard.js
import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import '../styles/VolunteerDashboard.css';


const VolunteerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [volunteerProfile, setVolunteerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, profileData] = await Promise.all([
        api.getVolunteerBookings('all'),
        api.getMyVolunteerProfile()
      ]);
      
      setAppointments(appointmentsData);
      setVolunteerProfile(profileData);
      setAvailabilitySlots(profileData.availableTimeSlots || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (bookingId) => {
    const reason = prompt('Please provide a reason for cancellation:');
    
    if (reason !== null && reason.trim()) {
      try {
        await api.cancelBooking(bookingId, reason);
        alert('Appointment cancelled successfully');
        fetchDashboardData();
      } catch (err) {
        console.error('Error cancelling appointment:', err);
        alert('Failed to cancel appointment');
      }
    }
  };

  const handleCompleteAppointment = async (bookingId) => {
    if (window.confirm('Mark this appointment as completed?')) {
      try {
        await api.completeBooking(bookingId);
        alert('Appointment marked as completed');
        fetchDashboardData();
      } catch (err) {
        console.error('Error completing appointment:', err);
        alert('Failed to complete appointment');
      }
    }
  };

// First, modify addAvailabilitySlot to include unique IDs:
const addAvailabilitySlot = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  setAvailabilitySlots([...availabilitySlots, {
    id: Date.now() + Math.random(), // Simple unique ID
    date: tomorrowStr,
    startTime: '09:00',
    endTime: '10:00',
    isActive: true
  }]);
};


const removeAvailabilitySlot = (slotId) => {
  const newSlots = availabilitySlots.filter(slot => slot.id !== slotId);
  setAvailabilitySlots(newSlots);
};

// Updated functions using ID:
const updateAvailabilitySlot = (slotId, field, value) => {
  const newSlots = availabilitySlots.map(slot => 
    slot.id === slotId ? { ...slot, [field]: value } : slot
  );
  setAvailabilitySlots(newSlots);
};

  const saveAvailability = async () => {
    try {
      // Validate slots before saving
      const validSlots = availabilitySlots.filter(slot => {
        const slotDate = new Date(slot.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return slotDate >= today && slot.startTime < slot.endTime;
      });

      if (validSlots.length !== availabilitySlots.length) {
        alert('Some slots were invalid (past dates or invalid times) and will be removed.');
      }

      await api.updateVolunteerAvailability(validSlots);
      alert('Availability updated successfully');
      setShowAvailabilityForm(false);
      fetchDashboardData();
    } catch (err) {
      console.error('Error updating availability:', err);
      alert('Failed to update availability');
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

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'confirmed' && new Date(apt.date) >= new Date()
  );

  const todayAppointments = upcomingAppointments.filter(apt => {
    const today = new Date();
    const aptDate = new Date(apt.date);
    return aptDate.toDateString() === today.toDateString();
  });

  // Sort availability slots by date
  const sortedAvailabilitySlots = [...availabilitySlots].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  if (loading) {
    return (
      <div className="volunteer-dashboard">
        <div className="loading-container">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="volunteer-dashboard">
        <div className="error-container">
          <p className="error-text">{error}</p>
          <button onClick={fetchDashboardData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="volunteer-dashboard">
      <div className="dashboard-header">
        <h1>Volunteer Dashboard</h1>
        <p>Welcome back, {user?.fullName}!</p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Today's Appointments</h3>
          <div className="stat-number">{todayAppointments.length}</div>
        </div>
        <div className="stat-card">
          <h3>Upcoming Appointments</h3>
          <div className="stat-number">{upcomingAppointments.length}</div>
        </div>
        <div className="stat-card">
          <h3>Services Offered</h3>
          <div className="stat-number">{volunteerProfile?.servicesOffered?.length || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Total Completed</h3>
          <div className="stat-number">
            {appointments.filter(apt => apt.status === 'completed').length}
          </div>
        </div>
      </div>

      {/* Today's Appointments */}
      {todayAppointments.length > 0 && (
        <div className="dashboard-section">
          <h2>Today's Appointments</h2>
          <div className="appointments-list">
            {todayAppointments.map(appointment => (
              <div key={appointment._id} className="appointment-card today">
                <div className="appointment-header">
                  <h3 className="service-name">{appointment.service.name}</h3>
                  <span className="time-badge">
                    {appointment.timeSlot.startTime} - {appointment.timeSlot.endTime}
                  </span>
                </div>
                
                <div className="appointment-details">
                  <div className="detail-item">
                    <strong>Client:</strong> {appointment.user.fullName}
                  </div>
                  <div className="detail-item">
                    <strong>Contact:</strong> {appointment.user.email}
                  </div>
                  {appointment.notes && (
                    <div className="detail-item">
                      <strong>Notes:</strong> {appointment.notes}
                    </div>
                  )}
                </div>

                <div className="appointment-actions">
                  <button 
                    onClick={() => handleCompleteAppointment(appointment._id)}
                    className="complete-button"
                  >
                    Mark Complete
                  </button>
                  <button 
                    onClick={() => handleCancelAppointment(appointment._id)}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manage Availability */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Manage Availability</h2>
          <button 
            onClick={() => setShowAvailabilityForm(!showAvailabilityForm)}
            className="manage-button"
          >
            {showAvailabilityForm ? 'Hide' : 'Update Availability'}
          </button>
        </div>

        {showAvailabilityForm && (
          <div className="availability-form">
            <div className="current-availability">
              <h3>Set Your Available Time Slots:</h3>
              {availabilitySlots.length === 0 ? (
                <p>No availability set. Add some time slots below.</p>
              ) : (
                <div className="availability-list">
                  {sortedAvailabilitySlots.map((slot) => (
                    <div key={slot.id} className="availability-slot">
                      <input
                        type="date"
                        value={slot.date}
                        onChange={(e) => updateAvailabilitySlot(slot.id, 'date', e.target.value)}
                        min={getMinDate()}
                        className="date-input"
                      />
                      <input 
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateAvailabilitySlot(slot.id, 'startTime', e.target.value)}
                        className="time-input"
                      />
                      <span>to</span>
                      <input 
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateAvailabilitySlot(slot.id, 'endTime', e.target.value)}
                        className="time-input"
                      />
                      <button 
                        onClick={() => removeAvailabilitySlot(slot.id)}
                        className="remove-slot-button"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="availability-actions">
                <button onClick={addAvailabilitySlot} className="add-slot-button">
                  Add Time Slot
                </button>
                <button onClick={saveAvailability} className="save-button">
                  Save Availability
                </button>
              </div>
            </div>
          </div>
        )}

        {!showAvailabilityForm && (
          <div className="current-availability-display">
            {availabilitySlots.length === 0 ? (
              <p>No availability set. Click "Update Availability" to add time slots.</p>
            ) : (
              <div className="availability-summary">
                <h3>Your Available Time Slots:</h3>
                {sortedAvailabilitySlots
                  .filter(slot => slot.isActive && new Date(slot.date) >= new Date())
                  .map((slot, index) => (
                    <div key={index} className="availability-item">
                      <span className="availability-date">
                        {formatDate(slot.date)}
                      </span>
                      <span className="availability-time">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                  ))}
                {sortedAvailabilitySlots.filter(slot => slot.isActive && new Date(slot.date) >= new Date()).length === 0 && (
                  <p>No future availability set.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Services Offered */}
      <div className="dashboard-section">
        <h2>Services You Offer</h2>
        {volunteerProfile?.servicesOffered?.length > 0 ? (
          <div className="volunteer-services-grid">
            {volunteerProfile.servicesOffered.map(service => (
              <div key={service._id} className="volunteer-service-card">
                <h3>{service.name}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-services">
            <p>You're not offering any services yet.</p>
            <a href="/services" className="browse-services-link">
              Browse Services to Offer
            </a>
          </div>
        )}
      </div>

      {/* All Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="dashboard-section">
          <h2>All Upcoming Appointments</h2>
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
  <strong>Time:</strong> 
  {appointment.timeSlot 
    ? `${appointment.timeSlot.startTime} - ${appointment.timeSlot.endTime}`
    : 'Time not specified'
  }
</div>
                  <div className="detail-item">
                    <strong>Client:</strong> {appointment.user.fullName}
                  </div>
                  <div className="detail-item">
                    <strong>Contact:</strong> {appointment.user.email}
                  </div>
                  {appointment.notes && (
                    <div className="detail-item">
                      <strong>Notes:</strong> {appointment.notes}
                    </div>
                  )}
                </div>

                <div className="appointment-actions">
                  <button 
                    onClick={() => handleCompleteAppointment(appointment._id)}
                    className="complete-button"
                  >
                    Mark Complete
                  </button>
                  <button 
                    onClick={() => handleCancelAppointment(appointment._id)}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="dashboard-section">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {appointments.slice(0, 5).map(appointment => (
            <div key={appointment._id} className="activity-item">
              <div className="activity-info">
                <span className="activity-service">{appointment.service.name}</span>
                <span className="activity-client">with {appointment.user.fullName}</span>
                <span className="activity-date">{formatDate(appointment.date)}</span>
              </div>
              <span 
                className="activity-status"
                style={{ color: getStatusColor(appointment.status) }}
              >
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;