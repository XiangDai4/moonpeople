import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import api from '../../services/api';
import '../../styles/Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAdminMenuOpen, setMobileAdminMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  
  // Fetch notification count for admin users
  useEffect(() => {
    const fetchNotifications = async () => {
      if (user && user.role === 'admin') {
        try {
          const response = await api.getContactNotificationCount();
          setNotificationCount(response.data.newMessages);
        } catch (error) {
          console.error('Error fetching notification count:', error);
        }
      }
    };

    fetchNotifications();
    
    // Optional: Set up polling to check for new messages every 30 seconds
    let interval;
    if (user && user.role === 'admin') {
      interval = setInterval(fetchNotifications, 30000); // 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user]);

  // Function to handle navigation and close mobile menu
  const handleNavigation = () => {
    setMobileMenuOpen(false);
    setMobileAdminMenuOpen(false);
    setMobileUserMenuOpen(false);
    
    // Scroll to top after a short delay to allow navigation to complete
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
        setMobileAdminMenuOpen(false);
        setMobileUserMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="header-content">
          <Link to="/" className="logo" onClick={handleNavigation}>
            <span className="logo-text">Moon People</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            
            {/* Only show Admin button if user exists and has admin role */}
            {user && user.role === 'admin' && (
              <div className="dropdown">
                <button className="dropdown-toggle">
                  Admin
                  {notificationCount > 0 && (
                    <span className="notification-badge">{notificationCount}</span>
                  )}
                </button>
                <div className="dropdown-menu">
                  <Link to="/admin/categories">Categories</Link>
                  <Link to="/admin/services">Services</Link>
                  <Link to="/admin/appointments">Appointments</Link>
                  <Link to="/admin/resources">Resources</Link>
                  <Link to="/admin/volunteers">Volunteers</Link>
                  <Link to="/admin/contact-messages" className="contact-messages-link">
                    Contact Messages
                    {notificationCount > 0 && (
                      <span className="notification-badge-inline">{notificationCount}</span>
                    )}
                  </Link>
                </div>
              </div>
            )}

            <Link to="/" className="nav-link">Home</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
            <Link to="/forum" className="nav-link">Forum</Link>
            <Link to="/resources" className="nav-link">Resources</Link>
            <Link to="/services" className="nav-link">Volunteer Opportunities</Link>

            <div className="divider"></div>
            
            <Link to="/need-support" className="nav-link-highlighted">I Need Support</Link>
            <Link to="/want-to-support" className="nav-link-highlighted secondary">I Want to Support</Link>
            
            {isAuthenticated ? (
              <div className="dropdown">
                <button 
                  className="dropdown-toggle"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Account
                </button>
                <div className="dropdown-menu">
                  {user?.role === 'volunteer' && (
                    <Link to="/volunteer-dashboard">Dashboard</Link>
                  )}
                  {user?.role === 'user' && (
                    <Link to="/my-appointments">My Appointments</Link>
                  )}
                  <Link to="/profile">Profile</Link>
                  <Link to="/messages">Messages</Link>
                  <Link to="/forum/favorites">My Favorites</Link>
                  <button onClick={logout} className="dropdown-logout-button">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="register-button">Register</Link>
              </div>
            )}
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-button"
            onClick={(e) => {
              e.stopPropagation();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        <div 
          className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Admin Mobile Menu */}
          {user && user.role === 'admin' && (
            <div className="mobile-admin-dropdown">
              <button 
                className="mobile-admin-toggle"
                onClick={() => setMobileAdminMenuOpen(!mobileAdminMenuOpen)}
              >
                Admin
                {notificationCount > 0 && (
                  <span className="notification-badge">{notificationCount}</span>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" className="mobile-nav-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileAdminMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  )}
                </svg>
              </button>
              <div className={`mobile-admin-menu ${mobileAdminMenuOpen ? 'open' : ''}`}>
                <Link to="/admin/categories" onClick={handleNavigation}>Categories</Link>
                <Link to="/admin/services" onClick={handleNavigation}>Services</Link>
                <Link to="/admin/appointments" onClick={handleNavigation}>Appointments</Link>
                <Link to="/admin/resources" onClick={handleNavigation}>Resources</Link>
                <Link to="/admin/volunteers" onClick={handleNavigation}>Volunteers</Link>
                <Link to="/admin/contact-messages" onClick={handleNavigation} className="contact-messages-link">
                  Contact Messages
                  {notificationCount > 0 && (
                    <span className="notification-badge-inline">{notificationCount}</span>
                  )}
                </Link>
              </div>
            </div>
          )}
          
          <Link to="/" className="mobile-nav-link" onClick={handleNavigation}>Home</Link>
          <Link to="/about" className="mobile-nav-link" onClick={handleNavigation}>About</Link>
          <Link to="/contact" className="mobile-nav-link" onClick={handleNavigation}>Contact</Link>
          <Link to="/resources" className="mobile-nav-link" onClick={handleNavigation}>Resources</Link>
          <Link to="/forum" className="mobile-nav-link" onClick={handleNavigation}>Forum</Link>
          <Link to="/services" className="mobile-nav-link" onClick={handleNavigation}>Volunteer Opportunities</Link>

          <div className="mobile-nav-divider"></div>
          
          <Link to="/need-support" className="mobile-nav-link primary" onClick={handleNavigation}>
            I Need Support
          </Link>
          <Link to="/want-to-support" className="mobile-nav-link secondary" onClick={handleNavigation}>
            I Want to Support
          </Link>
          
          <div className="mobile-nav-divider"></div>
          
          {isAuthenticated ? (
            <div className="mobile-user-dropdown">
              <button 
                className="mobile-user-toggle"
                onClick={() => setMobileUserMenuOpen(!mobileUserMenuOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mobile-nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Account
                <svg xmlns="http://www.w3.org/2000/svg" className="mobile-nav-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileUserMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  )}
                </svg>
              </button>
              <div className={`mobile-user-menu ${mobileUserMenuOpen ? 'open' : ''}`}>
                {user?.role === 'volunteer' && (
                  <Link to="/volunteer-dashboard" className="mobile-nav-link" onClick={handleNavigation}>
                    Dashboard
                  </Link>
                )}
                {user?.role === 'user' && (
                  <Link to="/my-appointments" className="mobile-nav-link" onClick={handleNavigation}>
                    My Appointments
                  </Link>
                )}
                <Link to="/profile" className="mobile-nav-link" onClick={handleNavigation}>
                  Profile
                </Link>
                <Link to="/messages" className="mobile-nav-link" onClick={handleNavigation}>
                  Messages
                </Link>
                <Link to="/forum/favorites" className="mobile-nav-link" onClick={handleNavigation}>
                  My Favorites
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    handleNavigation();
                  }} 
                  className="mobile-nav-button"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="mobile-nav-link" onClick={handleNavigation}>
                Login
              </Link>
              <Link to="/register" className="mobile-nav-link register" onClick={handleNavigation}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;