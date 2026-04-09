import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LoginPage from './Pages/LoginPage';
import Dashboard from './Pages/Dashboard';
import SearchPage from './Pages/SearchPage';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;