import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/VolunteerRegistration.css';

const VolunteerRegistration = () => {
  const [formData, setFormData] = useState({
    skills: [],
    availability: '',
    interests: [],
    experience: '',
    motivation: '',
    previousVolunteerWork: '',
    timeCommitment: '',
    preferredContactMethod: 'email'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingProfile, setExistingProfile] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Predefined options
  const skillOptions = [
    'Counseling/Therapy',
    'Medical Background',
    'Nutrition/Dietetics',
    'Fitness/Exercise',
    'Beauty/Cosmetology',
    'Transportation',
    'Cooking/Meal Prep',
    'Childcare',
    'Pet Care',
    'Administrative',
    'Technology Support',
    'Language Translation',
    'Event Planning',
    'Photography',
    'Art/Creative Therapy',
    'Music Therapy',
    'Writing/Communication',
    'Legal Services',
    'Financial Planning',
    'Home Maintenance'
  ];

  const interestOptions = [
    'One-on-one Support',
    'Group Activities',
    'Online Support',
    'Hospital Visits',
    'Home Visits',
    'Support Groups',
    'Educational Workshops',
    'Fundraising Events',
    'Awareness Campaigns',
    'Family Support',
    'Caregiver Support',
    'Bereavement Support',
    'Wellness Activities',
    'Recreation/Entertainment',
    'Spiritual Support'
  ];

  const timeCommitmentOptions = [
    '1-2 hours/week',
    '3-5 hours/week',
    '6-10 hours/week',
    '10+ hours/week',
    'Flexible'
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Check if user already has a volunteer profile
    fetchExistingProfile();
  }, [user, navigate]);

  const fetchExistingProfile = async () => {
    try {
      const response = await api.get('/volunteers/profile/me');
      setExistingProfile(response);
      // Pre-populate form with existing data
      setFormData({
        skills: response.skills || [],
        availability: response.availability || '',
        interests: response.interests || [],
        experience: response.experience || '',
        motivation: response.motivation || '',
        previousVolunteerWork: response.previousVolunteerWork || '',
        timeCommitment: response.timeCommitment || '',
        preferredContactMethod: response.preferredContactMethod || 'email'
      });
    } catch (error) {
      // No existing profile found, which is fine
      if (!error.message.includes('not found')) {
        setError('Error loading existing profile');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.availability.trim()) {
      setError('Please provide your availability information');
      setLoading(false);
      return;
    }

    if (!formData.timeCommitment) {
      setError('Please select your preferred time commitment');
      setLoading(false);
      return;
    }

    if (!formData.motivation.trim()) {
      setError('Please share your motivation for volunteering');
      setLoading(false);
      return;
    }

    try {
      if (existingProfile) {
        // Update existing profile
        await api.put('/volunteers/profile/me', formData);
        setSuccess('Your volunteer profile has been updated successfully!');
      } else {
        // Create new profile
        await api.post('/volunteers/profile', formData);
        setSuccess('Your volunteer application has been submitted successfully! We will review it and get back to you soon.');
      }

      setTimeout(() => {
        navigate('/want-to-support');
      }, 2000);
    } catch (error) {
      setError(error.message || 'An error occurred while submitting your application');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <div className="volunteer-registration-page">
      <div className="registration-container">
        <div className="registration-header">
          <h1>{existingProfile ? 'Update Volunteer Profile' : 'Volunteer Registration'}</h1>
          <p>Help us match you with the perfect volunteer opportunities by sharing some information about yourself.</p>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          {/* Skills Section */}
          <div className="form-section">
            <h3>Skills & Expertise</h3>
            <p>Select all skills that apply to you:</p>
            <div className="checkbox-grid">
              {skillOptions.map(skill => (
                <label key={skill} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.skills.includes(skill)}
                    onChange={() => handleCheckboxChange('skills', skill)}
                  />
                  <span>{skill}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Interests Section */}
          <div className="form-section">
            <h3>Areas of Interest</h3>
            <p>What types of volunteer activities interest you most?</p>
            <div className="checkbox-grid">
              {interestOptions.map(interest => (
                <label key={interest} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.interests.includes(interest)}
                    onChange={() => handleCheckboxChange('interests', interest)}
                  />
                  <span>{interest}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability Section */}
          <div className="form-section">
            <h3>Availability</h3>
            <div className="form-group">
              <label>Time Commitment Preference *</label>
              <select
                name="timeCommitment"
                value={formData.timeCommitment}
                onChange={handleInputChange}
                required
              >
                <option value="">Select time commitment</option>
                {timeCommitmentOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Schedule Details *</label>
              <textarea
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                placeholder="Please describe your availability (e.g., weekday evenings, weekend mornings, flexible schedule, specific days/times you prefer)"
                rows="4"
                required
              />
            </div>
          </div>

          {/* Experience Section */}
          <div className="form-section">
            <h3>Experience & Background</h3>
            <div className="form-group">
              <label>Relevant Experience</label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="Share any relevant experience you have (professional, personal, or educational) that might be helpful in supporting cancer patients"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Previous Volunteer Work</label>
              <textarea
                name="previousVolunteerWork"
                value={formData.previousVolunteerWork}
                onChange={handleInputChange}
                placeholder="Tell us about any previous volunteer experience you've had"
                rows="3"
              />
            </div>
          </div>

          {/* Motivation Section */}
          <div className="form-section">
            <h3>Motivation</h3>
            <div className="form-group">
              <label>Why do you want to volunteer with Moon People? *</label>
              <textarea
                name="motivation"
                value={formData.motivation}
                onChange={handleInputChange}
                placeholder="Share what motivates you to volunteer and support people affected by cancer"
                rows="4"
                required
              />
            </div>
          </div>

          {/* Contact Preferences */}
          <div className="form-section">
            <h3>Contact Preferences</h3>
            <div className="form-group">
              <label>Preferred Contact Method</label>
              <select
                name="preferredContactMethod"
                value={formData.preferredContactMethod}
                onChange={handleInputChange}
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="either">Either Email or Phone</option>
              </select>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-button" 
              disabled={loading}
            >
              {loading ? 'Submitting...' : (existingProfile ? 'Update Profile' : 'Submit Application')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VolunteerRegistration;