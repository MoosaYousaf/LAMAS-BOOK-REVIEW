// App.js — root component. Wraps the entire app in:
//   GoogleOAuthProvider — enables Google sign-in via @react-oauth/google
//   UserProvider        — fetches the Supabase session + Profiles row once at app
//                         mount so every page can call useUser() instead of making
//                         its own auth requests (see src/Context/UserContext.js)
//   Router              — provides client-side navigation via react-router-dom
//
// Route structure:
//   /             — LoginPage
//   /dashboard    — main home feed for logged-in users
//   /search       — full search results page
//   /book/:isbn   — book detail page
//   /friends      — community / friends feed
//   /signup       — email sign-up
//   /createAccount — onboarding flow after first sign-in
//   /forgotPassword / /resetPassword — password recovery
//   /profile/:userId? — user profile (own or another user's)
//   /settings     — account settings
//   /notifications — follow requests and activity alerts

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
// [PERF FIX #1] Import UserProvider to wrap the app in global user context.
// This eliminates redundant auth fetches across pages and components.
import { UserProvider } from './Context/UserContext';
import LoginPage from './Pages/LoginPage';
import Dashboard from './Pages/Dashboard';
import SearchPage from './Pages/SearchPage';
import CreateAccountPage from './Pages/CreateAccountPage';
import SignUpPage from './Pages/SignUpPage';
import ForgotPasswordPage from './Pages/PasswordRecovery/ForgotPasswordPage';
import ResetPasswordPage from './Pages/PasswordRecovery/RecoverPasswordPage';
import FriendsPage from './Pages/FriendsPage';
import BookDetailPage from './Pages/BookDetailPage';
import Profile from './Pages/PersonalAccount/Profile';
import SettingPage from './Pages/SettingPage';
import Notifications from './Pages/Notifications';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {/* [PERF FIX #1] UserProvider fetches auth + profile once at app mount.
          All child components read from useUser() instead of making their own calls. */}
      <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/book/:isbn" element={<BookDetailPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/createAccount" element={<CreateAccountPage />} />
          <Route path="/forgotPassword" element={<ForgotPasswordPage/>} />
          <Route path="/resetPassword" element={<ResetPasswordPage/>} />
          <Route path="/profile/:userId?" element={<Profile />} />
          <Route path="/settings" element={<SettingPage />} />
          {/* [FIX #6] MainPage was legacy dead code with a broken schema reference
              (book.cover does not exist) and no Supabase integration. Route removed. */}
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </Router>
      </UserProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
