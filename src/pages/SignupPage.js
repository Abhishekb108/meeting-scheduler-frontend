import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import '../styles/SignupPage.css';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!formData.agreeToTerms) {
      setError('You must agree to the terms');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await API.post('/auth/signup', {
        username: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem('token', response.data.token);
      navigate('/login');
    } catch (err) {
      console.log('Signup Error:', err);
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-left">
        <div className="logo-container">
          <div className="logo">
            <img src="/logo.png" alt="CNNCT Logo" />
          </div>
        </div>

        <div className="signup-form-container">
          <h1>Create an account</h1>
          <div className="signin-link">
            <Link to="/login">Sign in instead</Link>
          </div>

          {error && <p className="error-message">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="firstName">First name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

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

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="terms-checkbox">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                required
              />
              <label htmlFor="agreeToTerms">
                By creating an account, I agree to our <a href="/terms">Terms of use</a> and{' '}
                <a href="/privacy">Privacy Policy</a>
              </label>
            </div>

            <button type="submit" className="signup-button">
              Create an account
            </button>
          </form>
        </div>
      </div>

      <div className="signup-right">
        <img src="/man.png" alt="Man working on computer" className="signup-image" />
      </div>

      <footer className="signup-footer">
        <div className="recaptcha-notice">
          This site is protected by reCAPTCHA and the{' '}
          <a href="https://policies.google.com/privacy">Google Privacy Policy</a> and{' '}
          <a href="https://policies.google.com/terms">Terms of Service</a> apply.
        </div>
      </footer>
    </div>
  );
};

export default SignupPage;