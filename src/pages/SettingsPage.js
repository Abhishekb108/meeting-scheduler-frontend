// meeting-scheduler-frontend/src/pages/SettingsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import API from '../api';
import '../styles/SettingsPage.css';

function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation(); // To determine the current route for active link styling
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch user details on component mount
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

    // Basic validation
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

      // Prepare update data
      const updateData = {
        email: email.trim(),
      };
      if (password) {
        updateData.password = password;
      }

      // Update user profile
      const response = await API.put('/user/settings', updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Show success message
      setSuccessMessage('Updated Successfully');

      // Clear password fields
      setPassword('');
      setConfirmPassword('');

      // Check if logout is required
      if (response.data.shouldLogout) {
        localStorage.removeItem('token');
        setTimeout(() => {
          navigate('/login');
        }, 2000); // Redirect to login after 2 seconds
      }
    } catch (err) {
      console.log('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  return (
    <div className="profile-container">
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
            onClick={() => navigate('/booking')} // Added navigation to /booking
          >
            Booking
          </div>
          <div className="nav-item">
            Availability
          </div>
          <div
            className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
            onClick={() => navigate('/settings')}
          >
            Settings
          </div>
        </nav>
        <div className="profile-badge">
          <img src="/man.png" alt="Profile" />
          <span>sarthak pal</span>
        </div>
      </div>

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

            <button type="submit" className="save-button">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SettingsPage;