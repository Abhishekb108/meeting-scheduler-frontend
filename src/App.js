// meeting-scheduler-frontend/src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Remove BrowserRouter import
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PreferencesPage from './pages/PreferencesPage';

function App() {
  return (
    <Routes> {/* Use Routes directly, no BrowserRouter */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/preference" element={<PreferencesPage />} />
    </Routes>
  );
}

export default App;