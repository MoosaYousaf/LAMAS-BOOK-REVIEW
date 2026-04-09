import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiHome } from 'react-icons/hi'; // Import the Home Icon
import { searchDatabase } from '../Services/searchService';
import SearchBar from '../Components/SearchBar';
import BookCard from '../Components/Cards/BookCard';
import UserCard from '../Components/Cards/UserCard';

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

  const sandBrownLight = '#E5D3B3'; 

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchTerm) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const data = await searchDatabase(searchTerm, searchType);
      setResults(data || []);
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
      
      {/* Thinner Sidebar */}
      <aside style={{ 
        width: '70px', 
        backgroundColor: sandBrownLight, 
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '2px 0 5px rgba(0,0,0,0.05)'
      }}>
        <h2 style={{ fontSize: '0.8rem', color: '#5D4037', marginBottom: '30px', fontWeight: 'bold' }}>LAMAS</h2>
        
        {/* React Home Icon Button */}
        <button 
          onClick={() => navigate('/dashboard')}
          title="Home"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            color: '#5D4037', // Matches your "Sand Brown" theme text
            transition: 'transform 0.1s, color 0.1s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.color = '#3E2723'; // Darker on hover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.color = '#5D4037';
          }}
        >
          <HiHome size={32} />
        </button>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ 
          padding: '20px', 
          borderBottom: '1px solid #eee', 
          display: 'flex', 
          justifyContent: 'center',
          backgroundColor: '#fff'
        }}>
          <SearchBar onSearch={handleNewSearch} />
        </header>

        <main style={{ padding: '40px', backgroundColor: '#fafafa', flex: 1 }}>
          <h3 style={{ color: '#5D4037', marginBottom: '20px' }}>Results for "{searchTerm}"</h3>
          
          {loading ? (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>
          ) : results.length === 0 ? (
            <div style={{ marginTop: '50px', textAlign: 'center', color: '#666' }}>
              <h3>This {searchType} has not been added to the database! Please be patient.</h3>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                {currentItems.map((item) => (
                  searchType === 'users' ? (
                    <UserCard key={item.id} user={item} />
                  ) : (
                    <BookCard key={item.id} book={item} />
                  )
                ))}
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