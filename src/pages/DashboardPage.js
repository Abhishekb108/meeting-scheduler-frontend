// meeting-scheduler-frontend/src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import API from '../api';
import '../styles/DashboardPage.css';

function DashboardPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation(); // To determine the current route for active link styling

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You are not authenticated. Please log in again.');
          navigate('/login');
          return;
        }

        const response = await API.get('/meetings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setEvents(response.data.meetings || []);
      } catch (err) {
        console.log('Error fetching events:', err);
        setError(err.response?.data?.message || 'Failed to fetch events.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [navigate]);

  const handleCreateNewEvent = () => {
    navigate('/create-event');
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  return (
    <div className="landing-page">
      <div className="sidebar">
        <div className="logo">
          <img src="/logo.png" alt="CNNCT Logo" />
        </div>
        <nav className="sidebar-nav">
          <div
            className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            <span>Events</span>
          </div>
          <div
            className={`nav-item ${location.pathname === '/booking' ? 'active' : ''}`}
            onClick={() => navigate('/booking')} // Added navigation to /booking
          >
            <span>Booking</span>
          </div>
          <div className="nav-item">
            <span>Availability</span>
          </div>
          <div
            className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
            onClick={() => navigate('/settings')}
          >
            <span>Settings</span>
          </div>
        </nav>
        <button className="create-btn" onClick={handleCreateNewEvent}>
          + Create
        </button>
      </div>

      <div className="main-content">
        <header>
          <h1>Event Types</h1>
          <p>Create events to share for people to book on your calendar.</p>
          <button className="add-new-event-btn" onClick={handleCreateNewEvent}>
            + Add New Event
          </button>
        </header>

        <div className="events-container">
          {loading && <p>Loading events...</p>}
          {error && <p className="error-message">{error}</p>}
          {!loading && !error && events.length === 0 && (
            <div className="no-events-placeholder">
              <p>No events created yet</p>
            </div>
          )}
          {!loading && !error && events.length > 0 && (
            <div className="event-list">
              {events.map((event) => (
                <div key={event._id} className="event-card">
                  <div
                    className="event-banner"
                    style={{ backgroundColor: event.backgroundColor || '#000000' }}
                  >
                    <div className="event-avatar">
                      <img src="/man.png" alt="User Avatar" />
                    </div>
                    <h3 className="event-title">{event.title}</h3>
                  </div>
                  <div className="event-details">
                    <p><strong>Date & Time:</strong> {formatDateTime(event.dateTime)}</p>
                    <p><strong>Link:</strong> <a href={event.link} target="_blank" rel="noopener noreferrer">{event.link}</a></p>
                    <p><strong>Participants:</strong> {event.emails?.length > 0 ? event.emails.join(', ') : 'None'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="user-profile">
        <img src="/man.png" alt="User" />
        <span>sarthak pal</span>
      </div>
    </div>
  );
}

export default DashboardPage;