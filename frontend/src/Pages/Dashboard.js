import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../Services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { MdPeople } from 'react-icons/md';
// [PERF FIX #1] Import useUser hook to read user data from global context
// instead of making redundant auth + Profiles fetches on every mount.
import { useUser } from '../Context/UserContext';
import SearchBar from '../Components/SearchBar';
import SidebarNav from '../Components/SidebarNav';
import BookCard from '../Components/Cards/BookCard';
import '../Styles/variables.css';
import '../Styles/Pages/Dashboard.css'

// [PERF FIX #7] Cache TTL — books are re-used for up to 5 minutes to avoid
// redundant Supabase fetches on every Dashboard navigation.
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_KEY = 'lbr_books_cache';

function Dashboard() {
  const navigate = useNavigate();

  // [PERF FIX #1] Removed local userProfile state — now reading from UserContext.
  // Previously this component called supabase.auth.getUser() and then queried
  // the Profiles table on every mount. Now handled once at app level.
  const { userProfile, loading: userLoading } = useUser();

  const [booksOfTheWeek, setBooksOfTheWeek] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [friendCount, setFriendCount] = useState(0);

  /**
   * fetchBooksOfTheWeek — fetches random book picks for the explore section.
   *
   * Uses sessionStorage caching to avoid redundant Supabase fetches when
   * navigating back to the Dashboard. Cache is bypassed when the user
   * explicitly clicks "Shuffle Picks" to request fresh randomized results.
   *
   * @param {boolean} bypassCache - If true, skips cache and fetches fresh data
   */
  const fetchBooksOfTheWeek = useCallback(async (bypassCache = false) => {
    setBooksLoading(true);

    // [PERF FIX #7] Check sessionStorage cache before making a network request.
    // This prevents redundant fetches when the user navigates away and back.
    if (!bypassCache) {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const { books, cachedAt } = JSON.parse(cached);
          const age = Date.now() - cachedAt;

          // [PERF FIX #7] Use cached data if it's less than CACHE_TTL_MS old.
          // This provides instant book display on Dashboard re-visits.
          if (age < CACHE_TTL_MS && books && books.length > 0) {
            setBooksOfTheWeek(books);
            setBooksLoading(false);
            return;
          }
        }
      } catch (e) {
        // [PERF FIX #7] sessionStorage can throw in private browsing mode.
        // Fail silently and proceed to fetch from network.
        console.warn('[Dashboard] sessionStorage read failed:', e.message);
      }
    } else {
      // [PERF FIX #7] "Shuffle Picks" button path — clear the cache so the user
      // always gets fresh randomized results when they explicitly request it.
      try {
        sessionStorage.removeItem(CACHE_KEY);
      } catch (e) {
        // Fail silently — cache clear is best-effort
      }
    }

    // [PERF FIX #2] Combined count + data into a single Supabase query.
    // Previously used two sequential round trips: one for count, one for data.
    // Now both arrive together, cutting book load time roughly in half.
    const { data, count, error } = await supabase
      .from('Books')
      .select('isbn, book_title, book_author, image_url_m, image_url_l', { count: 'exact' })
      .limit(24);

    if (error || !count || count === 0) {
      setBooksOfTheWeek([]);
      setBooksLoading(false);
      return;
    }

    if (data) {
      const shuffledBooks = [...data].sort(() => Math.random() - 0.5);
      setBooksOfTheWeek(shuffledBooks);

      // [PERF FIX #7] Write fetched books to sessionStorage cache.
      // Next Dashboard visit within CACHE_TTL_MS will load instantly from cache.
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          books: shuffledBooks,
          cachedAt: Date.now()
        }));
      } catch (e) {
        // [PERF FIX #7] sessionStorage can throw in private browsing mode or when full.
        // Fail silently — caching is a performance optimization, not critical.
        console.warn('[Dashboard] sessionStorage write failed:', e.message);
      }
    }
    setBooksLoading(false);
  }, []);

  // [PERF FIX #1] Redirect logic now based on UserContext instead of local fetch.
  // Previously syncUserSession called getUser() + Profiles query on every mount.
  // Now the context provides userProfile; we only need to check it and redirect.
  useEffect(() => {
    // Wait for UserContext to finish loading before making redirect decisions
    if (userLoading) return;

    // Not authenticated — redirect to login
    if (!userProfile) {
      navigate('/');
      return;
    }

    // Onboarding incomplete — redirect to create account flow
    if (!userProfile.is_onboarding_complete) {
      navigate('/createAccount');
      return;
    }
  }, [userProfile, userLoading, navigate]);

  // [PERF FIX #1] Friend count fetch — the only local async logic remaining.
  // This runs only when we have a valid userProfile from context.
  useEffect(() => {
    const fetchFriendCount = async () => {
      if (!userProfile?.id) return;

      const [followingRes, followersRes] = await Promise.all([
        supabase.from('Followers').select('following_id').eq('follower_id', userProfile.id).eq('status', 'accepted'),
        supabase.from('Followers').select('follower_id').eq('following_id', userProfile.id).eq('status', 'accepted'),
      ]);
      const followingIds = new Set(followingRes.data?.map(f => f.following_id));
      const mutualCount = followersRes.data?.filter(f => followingIds.has(f.follower_id)).length || 0;
      setFriendCount(mutualCount);
    };

    fetchFriendCount();
  }, [userProfile?.id]);

  // [PERF FIX #7] Books fetch on mount — uses sessionStorage cache when available.
  useEffect(() => {
    fetchBooksOfTheWeek();
  }, [fetchBooksOfTheWeek]);

  // [PERF FIX #1] Loading state now from UserContext instead of local state.
  if (userLoading) {
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
              {/* [PERF FIX #7] Shuffle Picks bypasses cache to ensure fresh randomized results */}
              <button
                type="button"
                onClick={() => fetchBooksOfTheWeek(true)}
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
