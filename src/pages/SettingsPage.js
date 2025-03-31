import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api';
import '../styles/SettingsPage.css';

function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userName, setUserName] = useState(null); // Initially null to avoid flash
  const [showSignOut, setShowSignOut] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You are not authenticated. Please log in again.');
          navigate('/login');
          return;
        }

        const response = await API.get('/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = response.data.user;
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
        setEmail(user.email || '');
        setUserName(user.username || 'User');
      } catch (err) {
        console.log('Error fetching user details:', err);
        setError(err.response?.data?.message || 'Failed to fetch user details.');
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not authenticated. Please log in again.');
        navigate('/login');
        return;
      }

      const updateData = {
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      };
      if (password) {
        updateData.password = password;
      }

      const response = await API.put('/user/settings', updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccessMessage('Updated Successfully');

      setPassword('');
      setConfirmPassword('');

      if (response.data.shouldLogout) {
        localStorage.removeItem('token');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      console.log('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleSignOut = () => {
    setShowSignOut((prev) => !prev);
  };

  return (
    <div className="profile-container">
      {/* Header for mobile view */}
      <div className="header">
        <div className="sidebar-logo">
          <img src="/logo.png" alt="CNNCT Logo" />
        </div>
        {userName && (
          <div className="profile-badge" onClick={toggleSignOut}>
            <img src="/boy.png" alt="Profile" />
            {showSignOut && (
              <div className="signout-dropdown">
                <button onClick={handleSignOut}>Sign Out</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar for desktop view */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <img src="/logo.png" alt="CNNCT Logo" />
        </div>
        <nav className="sidebar-nav">
          <div
            className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            Events
          </div>
          <div
            className={`nav-item ${location.pathname === '/booking' ? 'active' : ''}`}
            onClick={() => navigate('/booking')}
          >
            Booking
          </div>
          <div
            className={`nav-item ${location.pathname === '/availability' ? 'active' : ''}`}
            onClick={() => navigate('/availability')}
          >
            Availability
          </div>
          <div
            className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
            onClick={() => navigate('/settings')}
          >
            Settings
          </div>
        </nav>
        {userName && (
          <div className="profile-badge" onClick={toggleSignOut}>
            <img src="/boy.png" alt="Profile" />
            <span>{userName}</span>
            {showSignOut && (
              <div className="signout-dropdown">
                <button onClick={handleSignOut}>Sign Out</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="profile-content">
        <h1>Settings</h1>
        <p>Manage settings for your profile</p>

        <form onSubmit={handleSave} className="profile-form">
          <div className="form-section">
            <h2>Edit Profile</h2>

            {error && <p className="error-message">{error}</p>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First name</label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last name</label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>

            <button type="submit" className="save-button">
              Save
            </button>
          </div>
        </form>
      </div>

      {/* Bottom navigation for mobile view */}
      <div className="bottom-nav">
        <div
          className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          <span className="nav-icon">📅</span>
          <span>Events</span>
        </div>
        <div
          className={`nav-item ${location.pathname === '/booking' ? 'active' : ''}`}
          onClick={() => navigate('/booking')}
        >
          <span className="nav-icon">📚</span>
          <span>Booking</span>
        </div>
        <div
          className={`nav-item ${location.pathname === '/availability' ? 'active' : ''}`}
          onClick={() => navigate('/availability')}
        >
          <span className="nav-icon">⏰</span>
          <span>Availability</span>
        </div>
        <div
          className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
          onClick={() => navigate('/settings')}
        >
          <span className="nav-icon">⚙️</span>
          <span>Settings</span>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;