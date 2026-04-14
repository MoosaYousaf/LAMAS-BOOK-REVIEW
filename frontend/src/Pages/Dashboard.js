import React, { useEffect, useState } from 'react';
import { supabase } from '../Services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../Components/SearchBar';

function Dashboard() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncUserSession = async () => {
      // get current session user
      const { data : { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        navigate('/'); // redirect to login if no session found
        return;
      }

      // check if user has a row in 'Profiles'
      const { data: profile, error: profileError } = await supabase
        .from('Profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // if no profile existsm send to createAccountPage
      if (profileError || !profile?.is_onboarding_complete) {
        navigate('/createAccount');
      } else {
        setUserProfile(profile); // session valud & profile complete
        setLoading(false);
      }
    };
    syncUserSession();
  }, [navigate]);

  const handleSearch = (query, type) => {
  if (!query) {
    console.warn("Search blocked: Query is empty");
    return;
  }

  const url = `/search?q=${encodeURIComponent(query)}&type=${type}`;
  //console.log("Navigating to:", url);
  
  navigate(url);
};


/*
*
*  I figure when we get into the design phase, instead of a blank screen with "syncing session...""
*  we can do some design instead, could be like an open book with pages turning, that way it ties to the
*  idea of the project; then we can place this everywhere
*/
if (loading) return <div style={{ padding: '20px'}}>Syncing session...</div>;

return (
  <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
      <h2>LAMAS BOOK REVIEW</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button
          onClick={() => navigate('/shelves')}
          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}
        >
          My Shelves
        </button>
        {userProfile ? (
          <>
            <span>Welcome, <strong>{userProfile.username}</strong>!</span>
            {userProfile.avatar_url && <img src={userProfile.avatar_url} alt="Profile" style={{ width: '40px', borderRadius: '50%', objectFit: 'cover' }} />}
          </>
          ) : (
            <span>Welcome, Guest!</span>
          )}
        </div>
      </header>
      
      <main style={{ marginTop: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3>Search Books or Users</h3>
          <SearchBar onSearch={handleSearch} />
      </main>
    </div>
  );
}

/*
  const location = useLocation();
  const user = location.state?.user; // Retrieve the user data passed from the LoginPage
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // TODO: Implement actual search functionality here later
  };

  return (

    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <h2>LAMAS BOOK REVIEW</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button
          onClick={() => navigate('/shelves')}
          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}
        >
          My Shelves
        </button>
          {user ? (
            <>
              <span>Welcome, <strong>{user.name}</strong>!</span>
              {user.picture && <img src={user.picture} alt="Profile" style={{ width: '40px', borderRadius: '50%' }} />}
            </>
          ) : (
            <span>Welcome, Guest!</span>
          )}
        </div>
      </header>

      <main style={{ marginTop: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h3>Search Books or Friends</h3>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <input
            type="text"
            placeholder="Search by title, author, or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '10px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ padding: '10px 20px', borderRadius: '5px', background: '#007BFF', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Search
          </button>
        </form>
      </main>
    </div>
  );
*/

export default Dashboard;