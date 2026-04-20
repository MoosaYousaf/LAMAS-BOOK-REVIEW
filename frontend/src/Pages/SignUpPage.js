import React, { useState } from 'react';
import { supabase } from '../Services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../Styles/authentication.css';

function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    const passwordRegex = /^(?=.*[A-Z]).{12,}$/;
    if (!passwordRegex.test(password)) {
      alert('Password does not meet requirements.');
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/createAccount',
      },
    });

    if (error) {
      alert(error.message);
    } else {
      navigate('/createAccount');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Sign Up</h2>

        <form onSubmit={handleSignup} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />

          <div className="auth-help-text">
            <p>Password must have:</p>
            <ul>
              <li>At least 12 characters</li>
              <li>At least one capital letter</li>
            </ul>
          </div>

          <button
            className="auth-primary-button auth-button auth-button-full"
            type="submit"
          >
            Sign Up
          </button>
        </form>

        <p
          className="auth-link"
          onClick={() => navigate('/')}
        >
          Already have an account? Log in
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;