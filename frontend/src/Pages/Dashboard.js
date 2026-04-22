import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../Services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { MdPeople } from 'react-icons/md';
import SearchBar from '../Components/SearchBar';
import SidebarNav from '../Components/SidebarNav';
import BookCard from '../Components/Cards/BookCard';
import '../Styles/variables.css';
import '../Styles/Pages/Dashboard.css'

function Dashboard() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booksOfTheWeek, setBooksOfTheWeek] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [friendCount, setFriendCount] = useState(0);

  const fetchBooksOfTheWeek = useCallback(async () => {
    setBooksLoading(true);
    const { count, error: countError } = await supabase
      .from('Books')
      .select('*', { count: 'exact', head: true });

    if (countError || !count || count === 0) {
      setBooksOfTheWeek([]);
      setBooksLoading(false);
      return;
    }

    const sampleSize = Math.min(24, count);
    const maxOffset = Math.max(0, count - sampleSize);
    const offset = Math.floor(Math.random() * maxOffset);

    const { data, error } = await supabase
      .from('Books')
      .select('isbn, book_title, book_author, image_url_m, image_url_l')
      .range(offset, offset + sampleSize - 1);

    if (!error && data) {
      setBooksOfTheWeek([...data].sort(() => Math.random() - 0.5));
    }
    setBooksLoading(false);
  }, []);

  useEffect(() => {
    const syncUserSession = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) { navigate('/'); return; }

      const { data: profile, error: profileError } = await supabase
        .from('Profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.is_onboarding_complete) {
        navigate('/createAccount');
      } else {
        setUserProfile(profile);

        // Fetch mutual friend count
        const [followingRes, followersRes] = await Promise.all([
          supabase.from('Followers').select('following_id').eq('follower_id', user.id).eq('status', 'accepted'),
          supabase.from('Followers').select('follower_id').eq('following_id', user.id).eq('status', 'accepted'),
        ]);
        const followingIds = new Set(followingRes.data?.map(f => f.following_id));
        const mutualCount = followersRes.data?.filter(f => followingIds.has(f.follower_id)).length || 0;
        setFriendCount(mutualCount);

        setLoading(false);
      }
    };

    syncUserSession();
    fetchBooksOfTheWeek();
  }, [navigate, fetchBooksOfTheWeek]);

  if (loading) {
    return (
      <div className="dashboard__syncing">
        Syncing session...
      </div>
    );
  }

  const avatarInitial = userProfile?.username?.charAt(0).toUpperCase() || '?';

  return (
    <div className="dashboard">
      {/* Background */}
      <div className="dashboard__bg" />

      {/* Sidebar */}
      <SidebarNav />

      {/* Main content */}
      <div className="dashboard__main">

        {/* Top bar */}
        <header className="dashboard__topbar">
          <h1 className="dashboard__site-title">Lamas Book Review</h1>

          <div className="dashboard__topbar-right">
            <div className="dashboard__friend-count">
              <MdPeople className="dashboard__friend-count-icon" />
              <span>{friendCount}</span>
            </div>

            <span className="dashboard__welcome">
              Welcome, <strong>{userProfile?.username}</strong>
            </span>

            {userProfile?.avatar_url ? (
              <img
                src={userProfile.avatar_url}
                alt={userProfile.username}
                className="dashboard__avatar"
                onClick={() => navigate(`/profile/${userProfile.id}`)}
              />
            ) : (
              <div
                className="dashboard__avatar-placeholder"
                onClick={() => navigate(`/profile/${userProfile?.id}`)}
              >
                {avatarInitial}
              </div>
            )}
          </div>
        </header>

        {/* Glass panel */}
        <div className="dashboard__panel">

          {/* Search section */}
          <div className="dashboard__search-section">
            <h2 className="dashboard__search-title">Search Books or Users</h2>
            <SearchBar />
          </div>

          {/* Explore section */}
          <div>
            <div className="dashboard__explore-header">
              <h3 className="dashboard__explore-title">Explore New Titles</h3>
              <button
                type="button"
                onClick={fetchBooksOfTheWeek}
                className="dashboard__shuffle-btn"
                disabled={booksLoading}
              >
                {booksLoading ? 'Shuffling...' : 'Shuffle Picks'}
              </button>
            </div>

            {booksLoading ? (
              <p className="dashboard__loading">Loading books...</p>
            ) : booksOfTheWeek.length === 0 ? (
              <p className="dashboard__empty">No books available to feature.</p>
            ) : (
              <div className="dashboard__book-grid">
                {booksOfTheWeek.map((book) => (
                  <button
                    key={book.isbn}
                    type="button"
                    onClick={() => navigate(`/book/${book.isbn}`, { state: { book } })}
                    style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                  >
                    <BookCard book={book} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
