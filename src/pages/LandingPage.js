import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css'; // Import modular CSS

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Header */}
      <header className="header">
        <div className="logo-container">
          <img src="/logo.svg" alt="CNNCT Logo" className="logo" /> {/* Assuming logo.svg is in public/ */}
          <span className="logo-text">CNNCT</span>
        </div>
        <Link to="/signup" className="signup-btn header-btn">Sign up free</Link>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">CNNCT – Easy Scheduling Ahead</h1>
        <Link to="/signup" className="signup-btn hero-btn">Sign up free</Link>
        <div className="dashboard-preview">
          <img src="/landingfigma.png" alt="Dashboard Preview" className="dashboard-img" /> {/* Updated path */}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="features-title">Simplified scheduling for you and your team</h2>
        <p className="features-description">
          CNNCT eliminates the back-and-forth of scheduling meetings so you can focus on what matters. Set your availability, share your link, and let others book time with you instantly.
        </p>
      </section>

      {/* Calendar Section */}
      <section className="calendar-section">
        <div className="calendar-content">
          <h2 className="section-title">Stay Organized with Your Calendar & Meetings</h2>
          <div className="calendar-features">
            <h3 className="feature-subtitle">Seamless Event Scheduling</h3>
            <ul className="feature-list">
              <li>View all your upcoming meetings and appointments in one place.</li>
              <li>Syncs with Google Calendar, Outlook, and iCloud to avoid conflicts</li>
              <li>Customize event types: one-on-ones, team meetings, group sessions, and webinars.</li>
            </ul>
          </div>
        </div>
        <div className="calendar-image">
          <img src="/calendar-preview.svg" alt="Calendar Preview" /> {/* Assuming this is in public/ */}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2 className="section-title">Here's what our <span className="highlight">customer</span> has to say</h2>
        <button className="read-stories-btn">Read customer stories</button>
        <div className="testimonials-grid">
          {[1, 2, 3, 4].map((_, index) => (
            <div className="testimonial-card" key={index}>
              <h3 className="testimonial-title">Amazing tool! Saved me months</h3>
              <p className="testimonial-text">
                This is a placeholder for your testimonials and what your client has to say, put them here and make sure it’s 100% true and meaningful.
              </p>
              <div className="testimonial-author">
                <div className="author-avatar blue"></div>
                <div className="author-info">
                  <div className="author-name">John Master</div>
                  <div className="author-position">Director, Spark.com</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Integrations Section */}
      <section className="integrations-section">
        <h2 className="section-title">All Link Apps and Integrations</h2>
        <div className="integrations-grid">
          {[
            { title: 'Audiomack', desc: 'Add an Audiomack player to your LinkHub', class: 'audiomack' },
            { title: 'Bandsintown', desc: 'Drive ticket sales by linking your events', class: 'bandsintown' },
            { title: 'Bonfire', desc: 'Display and sell your custom merch', class: 'bonfire' },
            { title: 'Books', desc: 'Promote books on your LinkHub', class: 'books' },
            { title: 'Buy Me A Gift', desc: 'Let others support you with a small gift', class: 'gift' },
            { title: 'Cameo', desc: 'Make impossible fan connections possible', class: 'cameo' },
            { title: 'Clubhouse', desc: 'Let your community in on this exclusive audio action', class: 'clubhouse' },
            { title: 'Community', desc: 'Build an SMS subscriber list', class: 'community' },
            { title: 'Contact Details', desc: 'Display your downloadable contact details', class: 'contact' },
          ].map((item, index) => (
            <div className="integration-card" key={index}>
              <div className={`integration-icon ${item.class}`}></div>
              <h4 className="integration-title">{item.title}</h4>
              <p className="integration-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-login">
            <Link to="/login" className="login-btn">Log in</Link>
            <Link to="/signup" className="signup-btn footer-signup">Sign up free</Link>
          </div>
          <div className="footer-links">
            {[
              { heading: 'About CNNCT', links: ['Blog', 'Press', 'Social Impact', 'Contact'] },
              { heading: 'Careers', links: ['Getting Noticed', 'Interviewing at CNNCT', 'FAQs', 'Hiring a Marketer'] },
              { heading: 'Terms and Conditions', links: ['Privacy Policy', 'Cookie Notice', 'Trust Center'] },
            ].map((column, index) => (
              <div className="footer-column" key={index}>
                <h5 className="footer-heading">{column.heading}</h5>
                <ul className="footer-list">
                  {column.links.map((link, i) => (
                    <li key={i}><a href="#">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <p className="copyright">
            We acknowledge the Traditional Custodians of the land on which our office resides, the Wurundjeri people of the Kulin Nation, and pay our respects to Elders past, present and emerging.
          </p>
          <div className="social-links">
            {['twitter', 'instagram', 'youtube', 'tiktok', 'facebook'].map((social, index) => (
              <a href="#" className={`social-icon ${social}`} key={index}></a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;