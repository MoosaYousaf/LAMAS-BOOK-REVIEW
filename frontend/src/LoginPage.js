import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

function LoginPage() {
  const navigate = useNavigate();

  const handleSuccess = (credentialResponse) => {
    console.log('Login Success:', credentialResponse);
    // Decode the JWT token to get user info
    const decodedUser = jwtDecode(credentialResponse.credential);
    console.log('Decoded User:', decodedUser);
    // Redirect to the dashboard and pass the user data in state
    navigate('/dashboard', { state: { user: decodedUser } });
  };

  const handleError = () => {
    console.log('Login Failed');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
      <h2>Login to LAMAS BOOK REVIEW</h2>
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
    </div>
  );
}

export default LoginPage;