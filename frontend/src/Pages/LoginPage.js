import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

/*

import { supabase } from '../Services/supabaseClient';
import { useEffect } from 'react';
import SearchBar from '../Components/SearchBar';



Comment out lines 22-33 and uncomment lines 35-50 to get back to normal login page.

Lines 22-33 are for testing connection to supabase and fetching data from Books table.

Currently working on setting up a search bar component for our website.

*/





function LoginPage() {
/*
  useEffect(() => {
    async function test() {
      const { data, error} = await supabase.from('Books').select('*');

      console.log('Data:', data);
    }

    test();
    }, []);
    
    return <div> Check Console </div>;
}
*/
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