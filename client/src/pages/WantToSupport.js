import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/WantToSupport.css';

const WantToSupport = () => {
  const [volunteerProfile, setVolunteerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchVolunteerProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchVolunteerProfile = async () => {
    try {
      const response = await api.get('/volunteers/profile/me');
      setVolunteerProfile(response);
    } catch (error) {
      if (error.message.includes('not found')) {
        setVolunteerProfile(null);
      } else {
        setError('Error loading volunteer profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    if (!user) {
      navigate('/login', { state: { from: '/want-to-support' } });
      return;
    }

    if (!volunteerProfile) {
      navigate('/volunteer-registration');
    } else {
      navigate('/opportunities');
    }
  };

  if (loading) {
    return (
      <div className="want-to-support-page">
        <div className="want-support-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="want-to-support-page">
      {/* Hero Section */}
      <section className="want-support-hero">
        <div className="want-support-hero-content">
          <h1>Make a Difference in Someone's Cancer Journey</h1>
          <p className="want-support-hero-subtitle">
            Join our community of volunteers and help provide support, comfort, and hope 
            to those facing cancer diagnoses.
          </p>
          <button className="want-support-cta-btn" onClick={handleGetStarted}>
            {!user ? 'Get Started' : 
             !volunteerProfile ? 'Become a Volunteer' : 'View Opportunities'}
          </button>
        </div>
      </section>

      {/* Current Status Section (for logged-in users) */}
      {user && (
        <section className="want-support-status">
          <div className="want-support-status-card">
            {!volunteerProfile ? (
              <div className="want-support-status-content">
                <h3>Ready to Start Volunteering?</h3>
                <p>Complete your volunteer registration to get started.</p>
                <Link to="/volunteer-registration" className="want-support-action-link">
                  Complete Registration →
                </Link>
              </div>
            ) : volunteerProfile.isApproved ? (
              <div className="want-support-status-content approved">
                <h3>✓ You're an Approved Volunteer!</h3>
                <p>Thank you for joining our community. Start exploring opportunities to help others.</p>
                <div className="want-support-status-actions">
                  <Link to="/opportunities" className="want-support-action-link">
                    View Opportunities →
                  </Link>
                  <Link to="/volunteer-profile" className="want-support-action-link secondary">
                    Manage Profile
                  </Link>
                </div>
              </div>
            ) : volunteerProfile.rejectionReason ? (
              <div className="want-support-status-content rejected">
                <h3>Application Update</h3>
                <p>Your volunteer application was not approved at this time.</p>
                <p className="want-support-rejection-reason">Reason: {volunteerProfile.rejectionReason}</p>
                <Link to="/volunteer-registration" className="want-support-action-link">
                  Update Application →
                </Link>
              </div>
            ) : (
              <div className="want-support-status-content pending">
                <h3>⏳ Application Under Review</h3>
                <p>Your volunteer application is being reviewed by our team. We'll notify you soon!</p>
                <Link to="/volunteer-profile" className="want-support-action-link secondary">
                  View Application
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="want-support-how-it-works">
        <h2 className="want-support-section-title">How Volunteering Works</h2>
        <div className="want-support-steps-grid">
          <div className="want-support-step">
            <div className="want-support-step-number">1</div>
            <h3>Register</h3>
            <p>Complete your volunteer profile with your skills, interests, and availability.</p>
          </div>
          <div className="want-support-step">
            <div className="want-support-step-number">2</div>
            <h3>Get Approved</h3>
            <p>Our team will review your application to ensure the best matches for our community.</p>
          </div>
          <div className="want-support-step">
            <div className="want-support-step-number">3</div>
            <h3>Start Helping</h3>
            <p>Browse opportunities and connect with those who need your unique support and skills.</p>
          </div>
        </div>
      </section>

      {/* Types of Support Section */}
      <section className="want-support-types">
        <h2 className="want-support-section-title">Ways to Support</h2>
        <div className="want-support-grid">
          <div className="want-support-type">
            <h3>Emotional Support</h3>
            <p>Provide companionship, active listening, and encouragement to those going through treatment.</p>
          </div>
          <div className="want-support-type">
            <h3>Practical Help</h3>
            <p>Assist with transportation, meal preparation, household tasks, or appointment accompaniment.</p>
          </div>
          <div className="want-support-type">
            <h3>Peer Mentoring</h3>
            <p>Share your own cancer journey experience to guide and inspire others facing similar challenges.</p>
          </div>
          <div className="want-support-type">
            <h3>Specialized Skills</h3>
            <p>Offer professional services like counseling, nutrition guidance, fitness instruction, or beauty services.</p>
          </div>
          <div className="want-support-type">
            <h3>Online Support</h3>
            <p>Provide virtual assistance, online companionship, or moderate support groups from anywhere.</p>
          </div>
          <div className="want-support-type">
            <h3>Event Support</h3>
            <p>Help organize and run community events, workshops, and support group meetings.</p>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="want-support-requirements">
        <h2 className="want-support-section-title">Volunteer Requirements</h2>
        <div className="want-support-requirements-content">
          <div className="want-support-requirement-item">
            <h4>Age Requirement</h4>
            <p>Must be 18 years or older</p>
          </div>
          <div className="want-support-requirement-item">
            <h4>Time Commitment</h4>
            <p>Minimum 2 hours per month (flexible scheduling available)</p>
          </div>
          <div className="want-support-requirement-item">
            <h4>Training</h4>
            <p>Complete basic volunteer orientation and any role-specific training</p>
          </div>
          <div className="want-support-requirement-item">
            <h4>Background Check</h4>
            <p>Some positions may require background verification</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="want-support-final-cta">
        <div className="want-support-cta-content">
          <h2>Ready to Make a Difference?</h2>
          <p>Join our community of compassionate volunteers today.</p>
          <button className="want-support-cta-btn" onClick={handleGetStarted}>
            {!user ? 'Get Started' : 
             !volunteerProfile ? 'Become a Volunteer' : 'View Opportunities'}
          </button>
          {!user && (
            <p className="want-support-login-prompt">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          )}
        </div>
      </section>

      {error && (
        <div className="want-support-error">
          {error}
        </div>
      )}
    </div>
  );
};

export default WantToSupport;