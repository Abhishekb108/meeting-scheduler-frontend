// meeting-scheduler-frontend/src/pages/BookingPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import '../styles/BookingPage.css';

function BookingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const tabs = ['Upcoming', 'Pending', 'Canceled', 'Past'];

  // Fetch user email and bookings on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You are not authenticated. Please log in again.');
          navigate('/login');
          return;
        }

        // Fetch user details to get email
        const userResponse = await API.get('/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserEmail(userResponse.data.user.email);

        // Fetch bookings
        const response = await API.get('/meetings/bookings', {
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

  // Filter meetings into tabs
  const filterMeetings = () => {
    const now = new Date();
    return {
      Upcoming: meetings.filter(meeting => new Date(meeting.dateTime) > now),
      Pending: meetings.filter(meeting => meeting.status === 'Pending'),
      Canceled: meetings.filter(meeting => meeting.status === 'Rejected'),
      Past: meetings.filter(meeting => new Date(meeting.dateTime) < now),
    };
  };

  const filteredMeetings = filterMeetings();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedMeeting(null); // Close participant modal when changing tabs
  };

  const handleMeetingSelect = (meeting) => {
    setSelectedMeeting(meeting);
  };

  const handleStatusUpdate = async (meetingId, status) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not authenticated. Please log in again.');
        navigate('/login');
        return;
      }

      await API.put(
        `/meetings/${meetingId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setMeetings(meetings.map(meeting => {
        if (meeting._id === meetingId) {
          const updatedMeeting = { ...meeting, status };
          if (status === 'Accepted') {
            if (!updatedMeeting.acceptedParticipants.includes(userEmail)) {
              updatedMeeting.acceptedParticipants.push(userEmail);
            }
          } else if (status === 'Rejected') {
            updatedMeeting.acceptedParticipants = updatedMeeting.acceptedParticipants.filter(
              email => email !== userEmail
            );
          }
          return updatedMeeting;
        }
        return meeting;
      }));

      setSelectedMeeting(null); // Close participant modal after action
    } catch (err) {
      console.log('Error updating status:', err);
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
      }),
      time: date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }),
    };
  };

  const getParticipantsSummary = (emails) => {
    if (!emails || emails.length === 0) return 'No participants';
    const otherParticipants = emails.filter(email => email !== userEmail);
    if (otherParticipants.length === 0) return 'You';
    if (otherParticipants.length === 1) return `You and ${otherParticipants[0]}`;
    return `You and team ${otherParticipants.length}`;
  };

  return (
    <div className="booking-container">
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
          <div className="nav-item">
            Availability
          </div>
          <div className="nav-item" onClick={() => navigate('/settings')}>
            Settings
          </div>
        </nav>
        <div className="profile-badge">
          <img src="/man.png" alt="Profile" />
          <span>sarthak pal</span>
        </div>
      </div>

      <div className="booking-content">
        <h1>Booking</h1>
        <p>See upcoming and past events booked through your event type links.</p>

        {error && <p className="error-message">{error}</p>}
        {loading && <p>Loading bookings...</p>}

        <div className="booking-tabs">
          {tabs.map(tab => (
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
            <p>No bookings in this category.</p>
          )}
          {!loading &&
            filteredMeetings[activeTab].map(meeting => {
              const { date, time } = formatDateTime(meeting.dateTime);
              return (
                <div
                  key={meeting._id}
                  className="meeting-item"
                  onClick={() => handleMeetingSelect(meeting)}
                >
                  <div className="meeting-date">{date}</div>
                  <div className="meeting-time">{time}</div>
                  <div className="meeting-title">{meeting.title}</div>
                  <div className="meeting-details">
                    <span>{getParticipantsSummary(meeting.emails)}</span>
                    <div className="meeting-actions">
                      {meeting.emails && (
                        <span className="meeting-participants">
                          👥 {meeting.emails.length} people
                        </span>
                      )}
                      {meeting.status === 'Pending' ? (
                        <>
                          <button
                            className="reject-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(meeting._id, 'Rejected');
                            }}
                          >
                            Reject
                          </button>
                          <button
                            className="accept-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(meeting._id, 'Accepted');
                            }}
                          >
                            Accept
                          </button>
                        </>
                      ) : (
                        <span className={`meeting-status ${meeting.status.toLowerCase()}`}>
                          {meeting.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {selectedMeeting && (
          <div className="participants-modal">
            <div className="participants-header">
              <h2>Participant ({selectedMeeting.emails.length})</h2>
              {selectedMeeting.status === 'Pending' && (
                <div className="participant-actions">
                  <button
                    className="reject-btn"
                    onClick={() => handleStatusUpdate(selectedMeeting._id, 'Rejected')}
                  >
                    Reject
                  </button>
                  <button
                    className="accept-btn"
                    onClick={() => handleStatusUpdate(selectedMeeting._id, 'Accepted')}
                  >
                    Accept
                  </button>
                </div>
              )}
            </div>
            <div className="participants-list">
              {selectedMeeting.emails.map((email, index) => (
                <div key={index} className="participant-item">
                  <img src="/man.png" alt="Participant" />
                  <span>{email}</span>
                  <input
                    type="checkbox"
                    checked={selectedMeeting.acceptedParticipants.includes(email)}
                    readOnly
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingPage;