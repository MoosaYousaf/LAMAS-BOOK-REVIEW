import React, { useState } from 'react';
import { supabase } from '../Services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../Styles/authentication.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  //Google Login Header
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Dashboard will check if the user has a profile record
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };

  // 2. Email/Password Login Handler
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Lamas Login</h2>

        <form onSubmit={handleEmailLogin} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            aria-label="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            aria-label="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />

          <div className="auth-button-row">
            <button
              className="auth-primary-button auth-button"
              type="submit"
              style={{ flex: 1 }}
            >
              Login
            </button>

            <button
              className="auth-primary-button auth-button"
              type="button"
              onClick={handleSignupClick}
              style={{ flex: 1 }}
            >
              Sign up
            </button>
          </div>

          <p
            className="auth-link-tight"
            onClick={() => navigate('/forgotPassword')}
          >
            Forgot Password?
          </p>
        </form>

        <div className="auth-divider">
          <div className="auth-divider-line" />
          <div className="auth-divider-text">or continue with Google</div>
          <div className="auth-divider-line" />
        </div>

        <div className="auth-google-wrap">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="auth-google-button"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              className="auth-google-logo"
            />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;