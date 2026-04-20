import React, { useState } from 'react';
import { supabase } from '../../Services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../../Styles/authentication.css';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/resetPassword',
    });

    if (error) {
      alert(error.message);
    } else {
      setMessage('Check your email for the password reset link!');
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Reset Your Password</h2>

        <p className="auth-description">
          Enter your email and we'll send you a link to get back into your account.
        </p>

        {message ? (
          <p className="auth-message">{message}</p>
        ) : (
          <form onSubmit={handleResetRequest} className="auth-form">
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
            />

            <button
              className="auth-primary-button auth-button auth-button-full"
              type="submit"
              disabled={loading}
              style={{
                cursor: loading ? 'default' : 'pointer',
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p
          className="auth-link"
          onClick={() => navigate('/')}
        >
          Back to Login
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;