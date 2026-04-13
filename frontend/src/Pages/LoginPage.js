import React, { useState } from 'react';
import { supabase } from '../Services/supabaseClient';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // 1. Google Login Handler
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Dashboard will check if the user has a profile record
        redirectTo: 'http://localhost:3000/dashboard',
      },
    });
  };

  // 2. Email/Password Login Handler
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { alert(error.message); }
    else { navigate('/dashboard'); }

  };

  return (
    <div style={styles.container}>
      <h2>LAMAS BOOK REVIEW</h2>

      {/* Google Auth Button */}
      <button onClick={handleGoogleLogin} style={styles.googleBtn}>
        Continue with Google
      </button>

      <div style={styles.divider}>OR</div>

      {/* Maunal Login Form */}
      <form onSubmit={handleEmailLogin} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          style={styles.input}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          style={styles.input}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" style={styles.submitBtn}>Login</button>
      </form>

      <p style={styles.linkText}>Don't have an account? <a href="/signup">Sign Up</a></p>
      <p style={styles.linkText}><a href="/forgotPassword">Forgot Password?</a></p>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px', gap: '15px', fontFamily: 'Arial' },
  googleBtn: { padding: '12px 20px', backgroundColor: '#4285F4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px', width: '300px' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ccc' },
  submitBtn: { padding: '10px', backgroundColor: '#333', color: 'white', borderRadius: '5px', cursor: 'pointer', border: 'none' },
  divider: { margin: '10px 0', color: '#666' },
  linkText: { fontSize: '14px' }
};

export default LoginPage;