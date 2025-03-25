// meeting-scheduler-frontend/src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PreferencesPage from './pages/PreferencesPage';
import DashboardPage from './pages/DashboardPage';
import CreateEventPage from './pages/CreateEventPage';
import EventLinkPage from './pages/EventLinkPage';
import SettingsPage from './pages/SettingsPage';
import BookingPage from './pages/BookingPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/preference" element={<PreferencesPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/create-event" element={<CreateEventPage />} />
      <Route path="/event-link/:id" element={<EventLinkPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/booking" element={<BookingPage />} />
    </Routes>
  );
}

export default App;