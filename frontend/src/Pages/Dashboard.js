import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../Services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { IoNotificationsCircle } from 'react-icons/io5';
import SearchBar from '../Components/SearchBar';
import SidebarNav from '../Components/SidebarNav';
import BookCard from '../Components/Cards/BookCard';

function Dashboard() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState('');
  const [loading, setLoading] = useState(true);
  const [booksOfTheWeek, setBooksOfTheWeek] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);

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

    // UPDATED: Changed sample size to 12
    const sampleSize = Math.min(12, count);
    const chosenIndexes = new Set();

    while (chosenIndexes.size < sampleSize) {
      chosenIndexes.add(Math.floor(Math.random() * count));
    }

    const randomIndexes = [...chosenIndexes];
    const randomBooks = [];

    for (const idx of randomIndexes) {
      const { data, error } = await supabase
        .from('Books')
        .select('isbn, book_title, book_author, image_url_m, image_url_l')
        .range(idx, idx)
        .single();

      if (!error && data) randomBooks.push(data);
    }

    setBooksOfTheWeek(randomBooks);
    setBooksLoading(false);
  }, []);

  useEffect(() => {
    const syncUserSession = async () => {
      const { data : { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        navigate('/');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('Profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.is_onboarding_complete) {
        navigate('/createAccount');
      } else {
        setUserProfile(profile);
        setLoading(false);
      }
    };

    syncUserSession();
    fetchBooksOfTheWeek();
  }, [navigate, fetchBooksOfTheWeek]);

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
        .from('Books')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error("Error fetching book count:", countError);
        return;
      }

      if (count && count > 0) {
        const randomIndex = Math.floor(Math.random() * count);

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
          handleSearch(data.book_title, 'books');
        }
      }
    } catch (err) {
      console.error("Unexpected error in feeling lucky:", err);
    }
  };

  if (loading) return <div style={{ padding: '20px'}}>Syncing session...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <SidebarNav />

      <div style={{ flex: 1, padding: '20px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
          <h2>LAMAS BOOK REVIEW</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button
              onClick={() => navigate('/notifications')}
              title="Notifications"
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <IoNotificationsCircle size={34} color="#555" />
            </button>
            {userProfile ? (
              <>
                <span>Welcome, <strong>{userProfile.username}</strong>!</span>
                {userProfile.avatar_url && (
                  <img
                    src={userProfile.avatar_url}
                    alt="Profile"
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                  />
                )}
              </>
            ) : (
              <span>Welcome, Guest!</span>
            )}
          </div>
        </header>

        <main style={{ marginTop: '30px' }}>
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

            {/* UPDATED: Increased maxWidth to 1600px for a wider container */}
            <div style={{ 
                marginTop: '50px', 
                width: '100%', 
                maxWidth: '1600px', 
                padding: '24px', 
                border: '1px solid #ccc', 
                borderRadius: '12px', 
                backgroundColor: '#fff' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Explore New Titles</h3>
                <button
                  type="button"
                  onClick={fetchBooksOfTheWeek}
                  style={{ border: '1px solid #ddd', background: '#fff', borderRadius: '16px', padding: '8px 14px', cursor: 'pointer' }}
                  disabled={booksLoading}
                >
                  {booksLoading ? 'Shuffling...' : 'Shuffle Picks'}
                </button>
              </div>

              {booksLoading ? (
                <p>Loading books...</p>
              ) : booksOfTheWeek.length === 0 ? (
                <p style={{ color: '#777' }}>No books available to feature.</p>
              ) : (
                <div style={{ 
                    display: 'grid', 
                    // Adjusted minmax and gap to handle 12 items comfortably
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                    gap: '30px' 
                }}>
                  {booksOfTheWeek.map((book) => (
                    <button
                      key={book.isbn}
                      type="button"
                      onClick={() => navigate(`/book/${book.isbn}`, { state: { book } })}
                      style={{ border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', padding: 0 }}
                    >
                      <BookCard book={book} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;