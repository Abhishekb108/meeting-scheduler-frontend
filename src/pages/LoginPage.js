// meeting-scheduler-frontend/src/pages/LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    showPassword: false,
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const togglePasswordVisibility = () => {
    setFormData({ ...formData, showPassword: !formData.showPassword });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await API.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem('token', response.data.token); // Store JWT
      navigate('/preference'); // Changed from /dashboard to /preference
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="logo-container">
          <div className="logo">
            <img src="/logo.png" alt="CNNCT Logo" />
            <span>CNNCT</span>
          </div>
        </div>

        <div className="login-form-container">
          <h1>Sign in</h1>

          {error && <p className="error-message">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group password-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input
                  type={formData.showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={togglePasswordVisibility}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>

            <button type="submit" className="login-button">
              Log in
            </button>
          </form>

          <div className="signup-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </div>

          <div className="recaptcha-notice">
            This site is protected by reCAPTCHA and the{' '}
            <a href="https://policies.google.com/privacy">Google Privacy Policy</a> and{' '}
            <a href="https://policies.google.com/terms">Terms of Service</a> apply.
          </div>
        </div>
      </div>

      <div className="login-right">
        <img src="/man.png" alt="Man working on computer" className="login-image" />
      </div>
    </div>
  );
};

export default LoginPage;