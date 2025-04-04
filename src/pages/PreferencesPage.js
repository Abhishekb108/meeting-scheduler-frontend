import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import '../styles/PreferencesPage.css';

const PreferencesPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has already completed preferences
    const checkPreferencesStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You are not authenticated. Please log in again.');
          navigate('/login');
          return;
        }

        const response = await API.get('/user/preferences-status', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // If preferences already completed, redirect to dashboard
        if (response.data.hasCompletedPreferences) {
          navigate('/dashboard');
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.log('Error checking preferences status:', err);
        setError(err.response?.data?.message || 'Failed to check preferences status. Please try again.');
        setIsLoading(false);
      }
    };

    checkPreferencesStatus();
  }, [navigate]);

  const categories = [
    { id: 'sales', name: 'Sales', icon: '💼' },
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'finance', name: 'Finance', icon: '💰' },
    { id: 'government', name: 'Government & Politics', icon: '⚖️' },
    { id: 'consulting', name: 'Consulting', icon: '📊' },
    { id: 'recruiting', name: 'Recruiting', icon: '📋' },
    { id: 'tech', name: 'Tech', icon: '💻' },
    { id: 'marketing', name: 'Marketing', icon: '🚀' }
  ];

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleContinue = async () => {
    if (!username || !selectedCategory) {
      setError('Please enter your username and select a category');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not authenticated. Please log in again.');
        navigate('/login');
        return;
      }

      await API.put(
        '/user/preferences',
        { username, category: selectedCategory },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate('/dashboard'); // Redirect to Dashboard after saving preferences
    } catch (err) {
      console.log('Error saving preferences:', err);
      setError(err.response?.data?.message || 'Failed to save preferences. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="preferences-container"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="preferences-container">
      <div className="preferences-left">
        <div className="logo-container">
          <div className="logo">
            <img src="/logo.png" alt="CNNCT Logo" />
          </div>
        </div>

        <div className="preferences-content">
          <h1>Your Preferences</h1>

          {error && <p className="error-message">{error}</p>}

          <div className="form-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tell us your username"
              className="username-input"
            />
          </div>

          <div className="category-section">
            <p className="category-label">Select one category that best describes your CNNCT:</p>

            <div className="categories-grid">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`category-card ${selectedCategory === category.id ? 'selected' : ''}`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-name">{category.name}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            className="continue-button"
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </div>

      <div className="preferences-right">
        <img src="/man.png" alt="Man working on computer" className="preferences-image" />
      </div>
    </div>
  );
};

export default PreferencesPage;