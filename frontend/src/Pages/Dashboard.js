import React, { useEffect, useState } from 'react';
import { supabase } from '../Services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../Components/SearchBar';
import SidebarNav from '../Components/SidebarNav';
import ShelvesManager from '../Components/Shelves/ShelvesManager';

function Dashboard() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('search');

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
  navigate(url);
};
const handleFeelingLucky = async () => {
  try {
    const { count, error: countError } = await supabase
      .from('Books') // <-- CHANGE THIS to your actual table name
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error("Error fetching book count:", countError);
      return;
    }

    if (count && count > 0) {
      //Pick a random index based on the total count
      const randomIndex = Math.floor(Math.random() * count);

      //Fetch just the book_title at that specific index
      const { data, error } = await supabase
        .from('Books')
        .select('book_title')
        .range(randomIndex, randomIndex)
        .single();

      if (error) {
        console.error("Error fetching lucky book:", error);
        return;
      }

      if (data?.book_title) {
        //Send the random title to your existing search handler
        handleSearch(data.book_title, 'books'); 
      }
    }
  } catch (err) {
    console.error("Unexpected error in feeling lucky:", err);
  }
};


/*
*
*  I figure when we get into the design phase, instead of a blank screen with "syncing session..."
*  we can do some design instead, could be like an open book with pages turning, that way it ties to the
*  idea of the project; then we can place this everywhere
*/
if (loading) return <div style={{ padding: '20px'}}>Syncing session...</div>;

return (
  <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
    <SidebarNav />

    <div style={{ flex: 1, padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <h2>LAMAS BOOK REVIEW</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button
          onClick={() => setActiveView((prev) => (prev === 'shelves' ? 'search' : 'shelves'))}
          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}
        >
          {activeView === 'shelves' ? 'Back to Search' : 'My Shelves'}
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
        
        <main style={{ marginTop: '30px' }}>
          {activeView === 'shelves' ? (
            <div>
              <h3 style={{ marginBottom: '12px' }}>My Shelves</h3>
              <ShelvesManager targetUserId={userProfile?.id} isOwnProfile />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
              <h3>Search Books or Users</h3>
              <SearchBar onSearch={handleSearch} />
              
              <button
                onClick={handleFeelingLucky}
                style={{
                  marginTop: '15px',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid #ddd',
                  background: '#f8f9fa',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#e2e6ea'}
                onMouseOut={(e) => e.target.style.background = '#f8f9fa'}
              >
                I'm Feeling Lucky 🎲
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


export default Dashboard;
