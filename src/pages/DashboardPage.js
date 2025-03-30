import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api';
import '../styles/DashboardPage.css';

function DashboardPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState(null); // Initially null to avoid flash
  const [showSignOut, setShowSignOut] = useState(false);

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

        const userResponse = await API.get('/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserName(userResponse.data.user.username || 'User');
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

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      await API.delete(`/meetings/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEvents((prevEvents) => prevEvents.filter((event) => event._id !== eventId));
    } catch (err) {
      console.log('Error deleting event:', err);
      setError(err.response?.data?.message || 'Failed to delete event.');
    }
  };

  const handleEditEvent = (eventId) => {
    navigate('/create-event', { state: { editEventId: eventId } });
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleSignOut = () => {
    setShowSignOut((prev) => !prev);
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
            onClick={() => navigate('/booking')}
          >
            <span>Booking</span>
          </div>
          <div
            className={`nav-item ${location.pathname === '/availability' ? 'active' : ''}`}
            onClick={() => navigate('/availability')}
          >
            <span>Availability</span>
          </div>
          <div
            className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
            onClick={() => navigate('/settings')}
          >
            <span>Settings</span>
          </div>
          <button className="create-btn" onClick={handleCreateNewEvent}>
            + Create
          </button>
        </nav>
        {userName && (
          <div className="profile-badge" onClick={toggleSignOut}>
            <img src="/boy.png" alt="User" />
            <span>{userName}</span>
            {showSignOut && (
              <div className="signout-dropdown">
                <button onClick={handleSignOut}>Sign Out</button>
              </div>
            )}
          </div>
        )}
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
                <div
                  key={event._id}
                  className={`event-card ${event.status === 'Accepted' ? 'event-active' : 'event-inactive'}`}
                >
                  <div className="event-details">
                    <p><strong>Title:</strong> {event.title}</p>
                    <p><strong>Date & Time:</strong> {formatDateTime(event.dateTime)}</p>
                    <p><strong>Link:</strong> <a href={event.link} target="_blank" rel="noopener noreferrer">{event.link}</a></p>
                    <p><strong>Participants:</strong> {event.emails?.length > 0 ? event.emails.join(', ') : 'None'}</p>
                  </div>
                  <div className="event-actions">
                    <label className="switch">
                      <input type="checkbox" defaultChecked={event.status === 'Accepted'} />
                      <span className="slider round"></span>
                    </label>
                    <button className="copy-btn" onClick={() => handleCopyLink(event.link)}>
                      <i className="fas fa-copy"></i>
                    </button>
                    <button className="edit-btn" onClick={() => handleEditEvent(event._id)}>
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="delete-btn" onClick={() => handleDeleteEvent(event._id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;