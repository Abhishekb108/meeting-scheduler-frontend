// meeting-scheduler-frontend/src/pages/CreateEventPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import '../styles/CreateEventPage.css';

function CreateEventPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    dateTime: '',
    duration: '60', // Default to 60 minutes
    type: 'group', // Default to group meeting
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form data
    if (!formData.title || formData.title.trim().length < 3) {
      setError('Event title is required and must be at least 3 characters');
      return;
    }
    if (!formData.dateTime) {
      setError('Date and time are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not authenticated. Please log in again.');
        navigate('/login');
        return;
      }

      // Send event data to backend
      const response = await API.post(
        '/meetings',
        {
          title: formData.title,
          dateTime: formData.dateTime,
          description: '', // Optional field
          link: `https://cnnct.com/meeting/${Date.now()}`, // Generate a dummy link for now
          status: 'accepted',
          category: 'upcoming',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Navigate to Screen 3 (Event Link Sharing) with the meeting ID
      navigate(`/event-link/${response.data.meeting._id}`);
    } catch (err) {
      console.log('Error creating event:', err);
      setError(err.response?.data?.message || 'Failed to create event. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="logo">
          <img src="/logo.png" alt="CNNCT Logo" />
        </div>
        <h2>Create New Event</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Event Title</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Enter event title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="dateTime">Date and Time</label>
            <input
              type="datetime-local"
              id="dateTime"
              name="dateTime"
              value={formData.dateTime}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="duration">Duration (minutes)</label>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="type">Event Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="group">Group Meeting</option>
              <option value="one-on-one">One-on-One</option>
            </select>
          </div>
          <button type="submit" className="signup-btn">Save</button>
        </form>
        <div className="login-link">
          <a href="/dashboard">Back to Dashboard</a>
        </div>
      </div>
    </div>
  );
}

export default CreateEventPage;