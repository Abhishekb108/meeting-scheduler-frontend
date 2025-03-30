import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page-image-only">
      <div className="landing-page-header">
        <img 
          src="/logo.png" 
          alt="CNNCT Logo" 
          className="landing-logo"
        />
        <div className="header-actions">
          <Link to="/login" className="overlay-login-btn">Log in</Link>
          <Link to="/signup" className="overlay-signup-btn">Sign up free</Link>
        </div>
      </div>
      
      <div className="landing-page-content">
        <h1 className="landing-title">CNNCT - Easy Scheduling Ahead</h1>
        <p className="landing-subtitle">
          Simplified scheduling for you and your team
        </p>
        <Link to="/signup" className="main-signup-btn">Sign up free</Link>
      </div>
      
      <img 
        src="/landingfigma.png"
        alt="CNNCT - Easy Scheduling Ahead"
        className="full-page-image"
      />
    </div>
  );
};

export default LandingPage;