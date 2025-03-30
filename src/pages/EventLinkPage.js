import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import API from '../api';
import '../styles/EventLinkPage.css';

function EventLinkPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [bannerTitle, setBannerTitle] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [meetingLink, setMeetingLink] = useState('');
  const [memberEmails, setMemberEmails] = useState('');
  const [error, setError] = useState('');
  const [userName, setUserName] = useState(location.state?.userName || 'sarthak pal');
  const [editEventId, setEditEventId] = useState(location.state?.editEventId || null);

  const backgroundColors = [
    { color: '#ff5722', hex: '#ff5722' },
    { color: '#000000', hex: '#000000' },
  ];

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You are not authenticated. Please log in again.');
          navigate('/login');
          return;
        }

        const response = await API.get(`/meetings/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.meeting) {
          setBannerTitle(response.data.meeting.title || 'Team A Meeting-1');
          setBackgroundColor(response.data.meeting.backgroundColor || '#000000');
          setMeetingLink(response.data.meeting.link || '');
          setMemberEmails(response.data.meeting.emails?.join(', ') || '');
        } else {
          setError('Meeting data not found in response.');
        }
      } catch (err) {
        console.log('Error fetching event:', err);
        setError(err.response?.data?.message || 'Failed to fetch event details.');
      }
    };

    fetchEvent();
  }, [id, navigate]);

  const handleBackgroundColorChange = (color) => {
    setBackgroundColor(color);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not authenticated. Please log in again.');
        navigate('/login');
        return;
      }

      const emailsArray = memberEmails
        .split(',')
        .map((email) => email.trim())
        .filter((email) => email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

      // If this is an edit, delete the original event before saving the new one
      if (editEventId) {
        await API.delete(`/meetings/${editEventId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // Save the new/updated event details
      await API.put(
        `/meetings/${id}`,
        {
          title: bannerTitle,
          backgroundColor,
          link: meetingLink,
          emails: emailsArray,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate('/dashboard', { state: { userName } }); // Redirect to Dashboard with userName
    } catch (err) {
      console.log('Error saving event updates:', err);
      setError(err.response?.data?.message || 'Failed to save event updates.');
    }
  };

  return (
    <div className="create-event-page">
      <div className="sidebar">
        <div className="logo">
          <img src="/logo.png" alt="CNNCT Logo" />
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item" onClick={() => navigate('/dashboard')}>
            <span>Events</span>
          </div>
          <div className="nav-item">
            <span>Booking</span>
          </div>
          <div className="nav-item">
            <span>Availability</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/settings')}>
            <span>Settings</span>
          </div>
        </nav>
        <button className="create-btn" onClick={() => navigate('/create-event')}>
          + Create
        </button>
      </div>

      <div className="main-content">
        <div className="event-creation-form">
          <h2>Add Event</h2>

          {error && <p className="error-message">{error}</p>}

          <div className="banner-section">
            <h3>Banner</h3>
            <div className="banner-preview">
              <div
                className="banner-content"
                style={{ backgroundColor: backgroundColor }}
              >
                <div className="banner-avatar">
                  <img src="/boy.png" alt="User Avatar" />
                </div>
                <div className="banner-title">
                  <input
                    type="text"
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    className="banner-title-input"
                  />
                </div>
              </div>

              <div className="background-color-selector">
                <h4>Custom Background Color</h4>
                <div className="color-options">
                  {backgroundColors.map((colorOption) => (
                    <div
                      key={colorOption.hex}
                      className={`color-circle ${backgroundColor === colorOption.hex ? 'selected' : ''}`}
                      style={{ backgroundColor: colorOption.hex }}
                      onClick={() => handleBackgroundColorChange(colorOption.hex)}
                    />
                  ))}
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="color-hex-input"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="meeting-details">
            <div className="form-group">
              <label>Add link *</label>
              <input
                type="text"
                placeholder="Enter URL Here"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Add Emails *</label>
              <input
                type="text"
                placeholder="Add member Emails"
                value={memberEmails}
                onChange={(e) => setMemberEmails(e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-cancel" onClick={() => navigate('/dashboard', { state: { userName } })}>
              Cancel
            </button>
            <button className="btn-save" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>

      <div className="user-profile">
        <img src="/boy.png" alt="User" />
        <span>{userName}</span> {/* Dynamic userName instead of hardcoded */}
      </div>
    </div>
  );
}

export default EventLinkPage;