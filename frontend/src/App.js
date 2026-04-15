import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LoginPage from './Pages/LoginPage';
import MainPage from './Pages/MainPage';
import Dashboard from './Pages/Dashboard';
import SearchPage from './Pages/SearchPage';
import CreateAccountPage from './Pages/CreateAccountPage';
import SignUpPage from './Pages/SignUpPage';
import ForgotPasswordPage from './Pages/PasswordRecovery/ForgotPasswordPage';
import ResetPasswordPage from './Pages/PasswordRecovery/RecoverPasswordPage';
import ShelvesManager from './Components/Shelves/ShelvesManager';
import FriendsPage from './Pages/FriendsPage';
import BookDetailPage from './Pages/BookDetailPage';
import Profile from './Pages/PersonalAccount/Profile';
import SettingPage from './Pages/SettingPage';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
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
          <Route path="/shelves" element={<ShelvesManager />} />
          <Route path="/profile/:userId?" element={<Profile />} />
          <Route path="/settings" element={<SettingPage />} />
          <Route path="/main> element={<MainPage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
