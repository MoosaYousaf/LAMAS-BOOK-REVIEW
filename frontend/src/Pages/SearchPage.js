import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchDatabase } from '../Services/searchService';
import { supabase } from '../Services/supabaseClient';
import SearchBar from '../Components/SearchBar';
import BookCard from '../Components/Cards/BookCard';
import UserCard from '../Components/Cards/UserCard';
import SidebarNav from '../Components/SidebarNav';

function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get('q');
  const searchType = queryParams.get('type');

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchTerm) {
        setLoading(false);
        return;
      }
      setLoading(true);

      // fetch search results
      const data = await searchDatabase(searchTerm, searchType);

      if ( searchType === 'users' && data ) {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const filteredUsers = data.filter(profile => profile.id !== user.id);
          setResults(filteredUsers);
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
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarNav />

      <div style={{ flex: 1 }}>
        <header style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'center' }}>
          <SearchBar onSearch={handleNewSearch} />
        </header>

        <main style={{ padding: '40px' }}>
          <h3 style={{ color: '#5D4037', marginBottom: '20px' }}>Results for "{searchTerm}"</h3>
          
          {loading ? (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>
          ) : results.length === 0 ? (
            <div style={{ marginTop: '50px', textAlign: 'center', color: '#666' }}>
              <h3>This {searchType} has not been added to the database! Please be patient.</h3>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center' }}>
                {currentItems.map((item) =>
                  searchType === 'users' ? (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (item.id) {
                          // navigate to the dynamic profile route
                          navigate(`/profile/${item.id}`);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                      aria-label={`View profile for ${item.username ?? 'user'}`}
                    >
                      <UserCard user={item} />
                    </div>
                  ) : (
                    <div
                      key={item.id ?? item.isbn}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/book/${encodeURIComponent(item.isbn ?? '')}`, { state: { book: item } })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/book/${encodeURIComponent(item.isbn ?? '')}`, { state: { book: item } });
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                      aria-label={`View details for ${item.book_title ?? 'book'}`}
                    >
                      <BookCard book={item} />
                    </div>
                  )
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(c => c - 1)}
                    style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}
                  >Prev</button>
                  <span style={{ fontWeight: 'bold', color: '#5D4037' }}>Page {currentPage} of {totalPages}</span>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(c => c + 1)}
                    style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}
                  >Next</button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default SearchPage;