import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api';
import '../styles/DashboardPage.css';
import axios from 'axios';

function DashboardPage() {
  const [events, setEvents] = useState([]);
  const [acceptedBookings, setAcceptedBookings] = useState([]);
  const [toggleStates, setToggleStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState(null);
  const [showSignOut, setShowSignOut] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You are not authenticated. Please log in again.');
          navigate('/login');
          return;
        }

        const eventResponse = await API.get('/meetings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const fetchedEvents = eventResponse.data.meetings || [];
        setEvents(fetchedEvents);

        const initialToggleStates = {};
        fetchedEvents.forEach((event) => {
          initialToggleStates[event._id] = true;
        });
        setToggleStates(initialToggleStates);

        const bookingResponse = await axios.get('https://meeting-scheduler-backend-dwlu.onrender.com/api/meetings/bookings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const allBookings = bookingResponse.data.meetings || [];
        const accepted = allBookings.filter((booking) => booking.status === 'Accepted');
        setAcceptedBookings(accepted);

        const userResponse = await API.get('/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserName(userResponse.data.user.username || 'User');
      } catch (err) {
        console.log('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      setToggleStates((prev) => {
        const newStates = { ...prev };
        delete newStates[eventId];
        return newStates;
      });
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

  const handleToggleChange = (eventId) => {
    setToggleStates((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  };

  const hasTimingConflict = (event) => {
    const eventStart = new Date(event.dateTime);
    const eventEnd = new Date(eventStart);
    eventEnd.setHours(eventStart.getHours() + 1);

    return acceptedBookings.some((booking) => {
      const bookingStart = new Date(booking.dateTime);
      const bookingEnd = new Date(bookingStart);
      bookingEnd.setHours(bookingStart.getHours() + 1);

      return eventStart < bookingEnd && eventEnd > bookingStart;
    });
  };

  return (
    <div className="landing-page">
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
              {events.map((event) => {
                const isToggledOn = toggleStates[event._id] !== undefined ? toggleStates[event._id] : true;
                const conflictExists = hasTimingConflict(event);
                return (
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
                    {isToggledOn && conflictExists && (
                      <p className="conflict-message">Conflict of Timing</p>
                    )}
                    <div className="event-actions">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={isToggledOn}
                          onChange={() => handleToggleChange(event._id)}
                        />
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
                );
              })}
            </div>
          )}
        </div>

        {/* Mobile Navigation Bar */}
        <div className="mobile-nav">
          <div
            className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            <span className="nav-icon">📅</span>
            Events
          </div>
          <div
            className={`nav-item ${location.pathname === '/booking' ? 'active' : ''}`}
            onClick={() => navigate('/booking')}
          >
            <span className="nav-icon">📚</span>
            Booking
          </div>
          <div
            className={`nav-item ${location.pathname === '/availability' ? 'active' : ''}`}
            onClick={() => navigate('/availability')}
          >
            <span className="nav-icon">⏰</span>
            Availability
          </div>
          <div
            className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
            onClick={() => navigate('/settings')}
          >
            <span className="nav-icon">⚙️</span>
            Settings
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;