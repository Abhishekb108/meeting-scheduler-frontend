import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import '../styles/BookingPage.css';
import axios from 'axios';

function BookingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState(null); // Initially null to avoid flash
  const [hoveredMeeting, setHoveredMeeting] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showSignOut, setShowSignOut] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false); // New state for mobile modal

  const tabs = ['Upcoming', 'Pending', 'Canceled', 'Past'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You are not authenticated. Please log in again.');
          navigate('/login');
          return;
        }

        const userResponse = await API.get('/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserEmail(userResponse.data.user.email);
        setUserName(userResponse.data.user.username || 'User');

        const response = await axios.get('https://meeting-scheduler-backend-dwlu.onrender.com/api/meetings/bookings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMeetings(response.data.meetings || []);
      } catch (err) {
        console.log('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to fetch bookings.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const filterMeetings = () => {
    const now = new Date();
    return {
      Upcoming: meetings.filter((meeting) => meeting.status === 'Accepted' && new Date(meeting.dateTime) > now),
      Pending: meetings.filter((meeting) => meeting.status === 'Pending'),
      Canceled: meetings.filter((meeting) => meeting.status === 'Rejected'),
      Past: meetings.filter((meeting) => meeting.status === 'Accepted' && new Date(meeting.dateTime) < now),
    };
  };

  const filteredMeetings = filterMeetings();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedMeeting(null);
    setIsMobileModalOpen(false); // Close modal when switching tabs
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
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });
    const timeStart = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const endDate = new Date(date);
    endDate.setHours(date.getHours() + 1);
    const timeEnd = endDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return {
      date: dateStr.split(',')[0],
      dayMonth: `${date.getDate()} ${date.toLocaleString('en-US', { month: 'short' })}`,
      fullDate: dateStr,
      timeRange: `${timeStart} - ${timeEnd}`,
      timeStart: timeStart,
    };
  };

  const getParticipantsSummary = (emails) => {
    if (!emails || emails.length === 0) return 'No participants';
    const otherParticipants = emails.filter((email) => email !== userEmail);
    if (otherParticipants.length === 0) return 'You';
    if (otherParticipants.length === 1) return `You and ${otherParticipants[0]}`;
    return `You and team ${otherParticipants.length}`;
  };

  const handleMeetingClick = (meeting) => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      setSelectedMeeting(meeting);
      setIsMobileModalOpen(true); // Open modal on mobile
    } else {
      setSelectedMeeting(selectedMeeting && selectedMeeting._id === meeting._id ? null : meeting);
    }
  };

  const handleAcceptReject = async (action, e, meetingId) => {
    e.stopPropagation();
    const meeting = meetings.find((m) => m._id === meetingId);
    if (!meeting) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not authenticated. Please log in again.');
        navigate('/login');
        return;
      }

      let newStatus = action === 'accept' ? 'Accepted' : 'Rejected';
      let acceptedParticipants = meeting.acceptedParticipants || [];

      if (action === 'accept' && !acceptedParticipants.includes(userEmail)) {
        acceptedParticipants.push(userEmail);
      }

      await axios.put(
        `http://localhost:5000/api/meetings/${meeting._id}/status`,
        {
          status: newStatus,
          acceptedParticipants,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMeetings((prevMeetings) =>
        prevMeetings.map((m) =>
          m._id === meeting._id
            ? { ...m, status: newStatus, acceptedParticipants }
            : m
        )
      );

      setSelectedMeeting(null);
      setIsMobileModalOpen(false); // Close modal after action
    } catch (err) {
      console.log(`Error ${action}ing meeting:`, err);
      setError(err.response?.data?.message || `Failed to ${action} meeting.`);
    }
  };

  return (
    <div className="booking-container">
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
        <div className="sidebar-logo">
          <img src="/logo.png" alt="CNNCT Logo" />
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item" onClick={() => navigate('/dashboard')}>
            Events
          </div>
          <div className="nav-item active">
            Booking
          </div>
          <div className="nav-item" onClick={() => navigate('/availability')}>
            Availability
          </div>
          <div className="nav-item" onClick={() => navigate('/settings')}>
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

      <div className="booking-content">
        <h1>Booking</h1>
        <p>See upcoming and past events booked through your event type links.</p>

        {error && <p className="error-message">{error}</p>}
        {loading && <p>Loading bookings...</p>}

        <div className="booking-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? 'active' : ''}
              onClick={() => handleTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="meetings-list">
          {!loading && filteredMeetings[activeTab].length === 0 && (
            <p className="no-meetings">No bookings in this category.</p>
          )}

          {!loading &&
            filteredMeetings[activeTab].map((meeting) => {
              const { date, dayMonth, timeRange, timeStart } = formatDateTime(meeting.dateTime);
              const isSelected = selectedMeeting && selectedMeeting._id === meeting._id;
              const isHovered = hoveredMeeting === meeting._id;

              return (
                <div
                  key={meeting._id}
                  className={`meeting-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleMeetingClick(meeting)}
                  onMouseEnter={() => setHoveredMeeting(meeting._id)}
                  onMouseLeave={() => setHoveredMeeting(null)}
                >
                  <div className="meeting-row">
                    <div className="meeting-date-column">
                      <div className="meeting-day">{date}</div>
                      <div className="meeting-day-month">{dayMonth}</div>
                      <div className="meeting-time">{timeStart}</div>
                    </div>

                    <div className="meeting-details-column">
                      <div className="meeting-title">{meeting.title}</div>
                      <div className="meeting-participants">{getParticipantsSummary(meeting.emails)}</div>
                    </div>

                    <div className="meeting-actions-column">
                      <div className="meeting-people">
                        <span className="people-icon">👥</span> {meeting.emails?.length || 0} people
                      </div>

                      {activeTab === 'Pending' ? (
                        <div className="action-buttons">
                          <button
                            className="reject-btn"
                            onClick={(e) => handleAcceptReject('reject', e, meeting._id)}
                          >
                            Reject
                          </button>
                          <button
                            className="accept-btn"
                            onClick={(e) => handleAcceptReject('accept', e, meeting._id)}
                          >
                            Accept
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`meeting-status ${meeting.status === 'Rejected' ? 'rejected' : 'accepted'}`}
                        >
                          {meeting.status}
                        </div>
                      )}
                    </div>
                  </div>

                  {isHovered && (
                    <div className="participants-panel hover-panel">
                      <div className="participants-header">
                        <h3>Participant ({meeting.emails?.length || 0})</h3>
                        {activeTab === 'Pending' && (
                          <div className="action-buttons">
                            <button
                              className="reject-btn"
                              onClick={(e) => handleAcceptReject('reject', e, meeting._id)}
                            >
                              Reject
                            </button>
                            <button
                              className="accept-btn"
                              onClick={(e) => handleAcceptReject('accept', e, meeting._id)}
                            >
                              Accept
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="participants-list">
                        {meeting.emails?.map((email, index) => (
                          <div key={index} className="participant-item">
                            <div className="participant-img-name">
                              <div className="participant-img">
                                {email.charAt(0).toUpperCase()}
                              </div>
                              <span>{email}</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={meeting.acceptedParticipants?.includes(email) || false}
                              readOnly
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isSelected && isMobileModalOpen && (
                    <div className="participants-modal">
                      <div className="participants-modal-content">
                        <div className="participants-header">
                          <h3>Participant ({meeting.emails?.length || 0})</h3>
                          <button
                            className="close-modal-btn"
                            onClick={() => setIsMobileModalOpen(false)}
                          >
                            ✕
                          </button>
                        </div>
                        <div className="participants-list">
                          {meeting.emails?.map((email, index) => (
                            <div key={index} className="participant-item">
                              <div className="participant-img-name">
                                <div className="participant-img">
                                  {email.charAt(0).toUpperCase()}
                                </div>
                                <span>{email}</span>
                              </div>
                              <input
                                type="checkbox"
                                checked={meeting.acceptedParticipants?.includes(email) || false}
                                readOnly
                              />
                            </div>
                          ))}
                        </div>
                        {activeTab === 'Pending' && (
                          <div className="modal-action-buttons">
                            <button
                              className="reject-btn"
                              onClick={(e) => handleAcceptReject('reject', e, meeting._id)}
                            >
                              Reject
                            </button>
                            <button
                              className="accept-btn"
                              onClick={(e) => handleAcceptReject('accept', e, meeting._id)}
                            >
                              Accept
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        <div className="mobile-nav">
          <div className="nav-item" onClick={() => navigate('/dashboard')}>
            <span className="nav-icon">📅</span>
            Events
          </div>
          <div className="nav-item active">
            <span className="nav-icon">📚</span>
            Booking
          </div>
          <div className="nav-item" onClick={() => navigate('/availability')}>
            <span className="nav-icon">⏰</span>
            Availability
          </div>
          <div className="nav-item" onClick={() => navigate('/settings')}>
            <span className="nav-icon">⚙️</span>
            Settings
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;