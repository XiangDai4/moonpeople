// client/src/pages/BookService.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import '../styles/BookService.css';

const BookService = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [service, setService] = useState(null);
  const [availableVolunteers, setAvailableVolunteers] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [volunteersLoading, setVolunteersLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchService();
  }, [serviceId]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableVolunteers();
    }
  }, [selectedDate]);

  const fetchService = async () => {
    try {
      const data = await api.getServiceById(serviceId);
      setService(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load service details');
      console.error(err);
      setLoading(false);
    }
  };

  const fetchAvailableVolunteers = async () => {
    try {
      setVolunteersLoading(true);
      const data = await api.getAvailableVolunteers(serviceId, selectedDate);
      setAvailableVolunteers(data);
      setSelectedVolunteer(null);
      setSelectedTimeSlot(null);
      setVolunteersLoading(false);
    } catch (err) {
      console.error('Error fetching available volunteers:', err);
      setAvailableVolunteers([]);
      setVolunteersLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    // Prevent booking in the past
    const today = new Date();
    const selectedDateObj = new Date(date);
    
    if (selectedDateObj < today) {
      alert('Cannot book appointments in the past');
      return;
    }
    
    setSelectedDate(date);
  };

  const handleVolunteerSelect = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
  };

  const handleBooking = async () => {
    if (!selectedVolunteer || !selectedTimeSlot || !selectedDate) {
      alert('Please select a date, volunteer, and time slot');
      return;
    }

    try {
      setBookingLoading(true);
      await api.createBooking({
        serviceId,
        volunteerId: selectedVolunteer.volunteerId,
        date: selectedDate,
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
        notes: notes.trim()
      });

      alert('Booking confirmed successfully!');
      navigate('/my-appointments');
    } catch (err) {
      console.error('Error creating booking:', err);
      alert(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const formatDisplayDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="book-service-container">
        <div className="loading-container">
          <p>Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="book-service-container">
        <div className="error-container">
          <p className="error-text">{error || 'Service not found'}</p>
          <button onClick={() => navigate('/services')} className="back-button">
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="book-service-container">
      <div className="booking-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <h1>Book: {service.name}</h1>
        <p className="service-description">{service.description}</p>
      </div>

      <div className="booking-form">
        {/* Step 1: Select Date */}
        <div className="booking-step">
          <h2>Step 1: Select Date</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            min={getMinDate()}
            className="date-input"
            required
          />
          {selectedDate && (
            <p className="selected-date-display">
              Selected: {formatDisplayDate(selectedDate)}
            </p>
          )}
        </div>

        {/* Step 2: Select Volunteer and Time */}
        {selectedDate && (
          <div className="booking-step">
            <h2>Step 2: Select Volunteer & Time</h2>
            
            {volunteersLoading ? (
              <div className="volunteers-loading">
                <p>Loading available volunteers...</p>
              </div>
            ) : availableVolunteers.length === 0 ? (
              <div className="no-volunteers">
                <p>No volunteers are available on {formatDisplayDate(selectedDate)}.</p>
                <p>Please try a different date.</p>
              </div>
            ) : (
              <div className="volunteers-list">
                {availableVolunteers.map(volunteer => (
                  <div 
                    key={volunteer.volunteerId} 
                    className={`volunteer-card ${selectedVolunteer?.volunteerId === volunteer.volunteerId ? 'selected' : ''}`}
                  >
                    <div className="volunteer-info">
                      <h3>{volunteer.volunteerName}</h3>
                      <p>{volunteer.availableSlots.length} time slot{volunteer.availableSlots.length !== 1 ? 's' : ''} available</p>
                    </div>
                    
                    <div className="time-slots">
                      {volunteer.availableSlots.map(slot => (
                        <button
                          key={`${slot.startTime}-${slot.endTime}`}
                          onClick={() => {
                            handleVolunteerSelect(volunteer);
                            handleTimeSlotSelect(slot);
                          }}
                          className={`time-slot-btn ${
                            selectedVolunteer?.volunteerId === volunteer.volunteerId && 
                            selectedTimeSlot?.startTime === slot.startTime && 
                            selectedTimeSlot?.endTime === slot.endTime ? 'selected' : ''
                          }`}
                        >
                          {slot.startTime} - {slot.endTime}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Add Notes */}
        {selectedVolunteer && selectedTimeSlot && (
          <div className="booking-step">
            <h2>Step 3: Additional Notes (Optional)</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests or information for the volunteer..."
              className="notes-textarea"
              maxLength={500}
            />
            <div className="character-count">
              {notes.length}/500 characters
            </div>
          </div>
        )}

        {/* Booking Summary */}
        {selectedVolunteer && selectedTimeSlot && (
          <div className="booking-summary">
            <h2>Booking Summary</h2>
            <div className="summary-details">
              <div className="summary-item">
                <strong>Service:</strong> {service.name}
              </div>
              <div className="summary-item">
                <strong>Date:</strong> {formatDisplayDate(selectedDate)}
              </div>
              <div className="summary-item">
                <strong>Time:</strong> {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
              </div>
              <div className="summary-item">
                <strong>Volunteer:</strong> {selectedVolunteer.volunteerName}
              </div>
              {notes && (
                <div className="summary-item">
                  <strong>Notes:</strong> {notes}
                </div>
              )}
            </div>

            <button
              onClick={handleBooking}
              disabled={bookingLoading}
              className="confirm-booking-btn"
            >
              {bookingLoading ? 'Confirming Booking...' : 'Confirm Booking'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookService;