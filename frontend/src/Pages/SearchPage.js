import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchDatabase } from '../Services/searchService';
import { supabase } from '../Services/supabaseClient';
import SearchBar from '../Components/SearchBar';
import BookCard from '../Components/Cards/BookCard';
import UserCard from '../Components/Cards/UserCard';
import SidebarNav from '../Components/SidebarNav';
import '../Styles/variables.css';
import '../Styles/Pages/SearchPage.css';

function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get('q');
  const searchType = queryParams.get('type');

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchTerm) {
        setLoading(false);
        return;
      }
      setLoading(true);

      const data = await searchDatabase(searchTerm, searchType);

      if (searchType === 'users' && data) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setResults(data.filter(profile => profile.id !== user.id));
        } else {
          setResults(data);
        }
      } else {
        setResults(data || []);
      }

      setLoading(false);
      setCurrentPage(1);
    };
    fetchResults();
  }, [searchTerm, searchType]);

  const handleNewSearch = (query, type) => {
    navigate(`/search?q=${encodeURIComponent(query)}&type=${type}`);
  };

  const currentItems = results.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(results.length / itemsPerPage);

  return (
    <div className="search-page">
      <div className="search-page__bg" />

      <SidebarNav />

      <div className="search-page__main">
        <header className="search-page__header">
          <SearchBar onSearch={handleNewSearch} />
        </header>

        <div className="search-page__content">
          {searchTerm && (
            <p className="search-page__results-title">
              Results for "<span>{searchTerm}</span>"
            </p>
          )}

          <div className="search-page__panel">
            {loading ? (
              <div className="search-page__loading">Loading...</div>
            ) : results.length === 0 ? (
              <div className="search-page__empty">
                <h3>No results found</h3>
                <p>This {searchType} hasn't been added to the database yet. Please be patient.</p>
              </div>
            ) : (
              <>
                {searchType === 'users' ? (
                  <div className="search-page__user-grid">
                    {currentItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => item.id && navigate(`/profile/${item.id}`)}
                        style={{ cursor: 'pointer' }}
                        aria-label={`View profile for ${item.username ?? 'user'}`}
                      >
                        <UserCard user={item} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="search-page__book-grid">
                    {currentItems.map((item) => (
                      <button
                        key={item.id ?? item.isbn}
                        type="button"
                        onClick={() => navigate(`/book/${encodeURIComponent(item.isbn ?? '')}`, { state: { book: item } })}
                        style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                        aria-label={`View details for ${item.book_title ?? 'book'}`}
                      >
                        <BookCard book={item} />
                      </button>
                    ))}
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="search-page__pagination">
                    <button
                      className="search-page__page-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(c => c - 1)}
                    >
                      Prev
                    </button>
                    <span className="search-page__page-info">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="search-page__page-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(c => c + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
