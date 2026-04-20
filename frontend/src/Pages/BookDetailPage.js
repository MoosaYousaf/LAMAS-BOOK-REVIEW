import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import SidebarNav from '../Components/SidebarNav';
import { supabase } from '../Services/supabaseClient';
import ReviewModal from '../Components/Reviews/ReviewModal';
import ReviewDetailModal from '../Components/Reviews/ReviewDetailModal';

function BookDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isbn } = useParams();

  // --- DATA LOGIC ---
  const [bookData, setBookData] = useState(location.state?.book || null);
  const bookIsbn = bookData?.isbn || isbn;

  const title = bookData?.book_title || bookData?.title || 'Loading...';
  const author = bookData?.book_author || bookData?.author || 'Loading author...';
  const cover = bookData?.image_url_l || bookData?.image_url_m || bookData?.image_url_s || 'https://via.placeholder.com/150x200?text=No+Image';
  const description = bookData?.description || bookData?.book_description || bookData?.summary || 'No description available.';

  // --- STATE FOR REVIEWS ---
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  // --- STATE FOR MODALS ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null); 

  // --- STATE FOR SHELVES ---
  const [myShelves, setMyShelves] = useState([]);
  const [showShelfSelector, setShowShelfSelector] = useState(false);
  const [isHoveringX, setIsHoveringX] = useState(null); 
  const [currentUser, setCurrentUser] = useState(null);

  // --- EFFECTS ---
  useEffect(() => {
    const fetchBookInfo = async () => {
      if (!bookData && isbn) {
        const { data, error } = await supabase
          .from('Books')
          .select('*')
          .eq('isbn', isbn)
          .single();
        
        if (!error && data) {
          setBookData(data);
        } else {
          setBookData({ book_title: 'Unknown Title', book_author: 'Unknown Author' });
        }
      }
    };
    fetchBookInfo();
  }, [isbn, bookData]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      if (user) fetchMyShelves(user.id);
    });
  }, [bookIsbn]);

  const fetchMyShelves = async (userId) => {
    const { data, error } = await supabase
      .from('UserLists')
      .select(`*, ListEntries(isbn)`)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (!error) {
      const slots = [...(data || [])];
      while (slots.length < 3) slots.push({ isPlaceholder: true });
      setMyShelves(slots);
    }
  };

  const toggleBookOnShelf = async (list) => {
    if (list.isPlaceholder) return;
    const isAlreadyIn = list.ListEntries?.some(e => e.isbn === bookIsbn);

    if (isAlreadyIn) {
      const { error } = await supabase
        .from('ListEntries')
        .delete()
        .match({ list_id: list.id, isbn: bookIsbn });
      if (!error) fetchMyShelves(currentUser.id);
    } else {
      const { error } = await supabase
        .from('ListEntries')
        .insert([{ list_id: list.id, isbn: bookIsbn }]);
      if (!error) fetchMyShelves(currentUser.id);
    }
  };

  const isInAnyShelf = myShelves.some(list => !list.isPlaceholder && list.ListEntries?.some(e => e.isbn === bookIsbn));

  // --- FETCH REVIEWS LOGIC ---
  const fetchReviews = async () => {
    if (!bookIsbn) return;
    setLoadingReviews(true);
    
    // Fetch reviews with joined profile data
    const { data, error } = await supabase
      .from('Reviews')
      .select(`
        id, 
        rating, 
        content, 
        created_at, 
        user_id,
        profiles:user_id (id, username, avatar_url)
      `)
      .eq('book_id', bookIsbn)
      .order('created_at', { ascending: false });

    if (!error) {
      setReviews(data || []);
    }
    setLoadingReviews(false);
  };

  useEffect(() => { fetchReviews(); }, [bookIsbn]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <SidebarNav />

      <div style={{ flex: 1, padding: '20px' }}>
        <button type="button" onClick={() => navigate(-1)} style={styles.backBtn}>Back</button>

        <div style={styles.detailContainer}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            <div style={{ position: 'relative' }}>
                <img src={cover} alt={title} style={styles.coverImg} />
                
                {currentUser && (
                    <div style={{ position: 'absolute', bottom: '10px', right: '5px' }}>
                        <button 
                            onClick={() => setShowShelfSelector(!showShelfSelector)}
                            style={{
                                ...styles.statusCircle,
                                backgroundColor: isInAnyShelf ? '#28a745' : '#fff',
                                color: isInAnyShelf ? '#fff' : '#333',
                                border: isInAnyShelf ? 'none' : '2px solid #ddd'
                            }}
                        >
                            {isInAnyShelf ? '✓' : '+'}
                        </button>

                        {showShelfSelector && (
                            <div style={styles.shelfDropdown}>
                                <h4 style={{ margin: '0 0 10px', fontSize: '14px' }}>Add to Shelf</h4>
                                {myShelves.map((list, idx) => {
                                    const inThisList = !list.isPlaceholder && list.ListEntries?.some(e => e.isbn === bookIsbn);
                                    
                                    return (
                                        <div 
                                            key={list.id || idx} 
                                            onClick={() => toggleBookOnShelf(list)}
                                            style={list.isPlaceholder ? styles.shelfItemDisabled : styles.shelfItem}
                                        >
                                            <span style={{ fontSize: '13px' }}>{list.isPlaceholder ? `Empty Shelf Slot ${idx+1}` : list.name}</span>
                                            
                                            {inThisList && (
                                                <div 
                                                    onMouseEnter={() => setIsHoveringX(list.id)}
                                                    onMouseLeave={() => setIsHoveringX(null)}
                                                    style={{
                                                        ...styles.miniCheck,
                                                        backgroundColor: isHoveringX === list.id ? '#dc3545' : '#28a745'
                                                    }}
                                                >
                                                    {isHoveringX === list.id ? '✕' : '✓'}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0 }}>{title}</h2>
              <div style={{ marginTop: '6px', color: '#555' }}><strong>Author:</strong> {author}</div>
              <div style={{ marginTop: '6px', color: '#555' }}><strong>ISBN:</strong> {bookIsbn || 'Unknown'}</div>

              <div style={{ marginTop: '14px' }}>
                <h4 style={{ margin: '0 0 8px' }}>Description</h4>
                <p style={styles.descriptionText}>{description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- REFACTORED REVIEW SECTION --- */}
        <div style={styles.reviewsContainer}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>User Reviews</h3>
            {currentUser && (
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                style={styles.submitBtn}
              >
                Write a Review
              </button>
            )}
          </div>

          {loadingReviews && <div>Loading reviews...</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {reviews.length > 0 ? (
              reviews.map((rev) => (
                <div key={rev.id} style={styles.reviewCardWrapper}>
                    {/* Clickable user profile info */}
                    <div style={styles.userInfoRow} onClick={() => navigate(`/profile/${rev.user_id}`)}>
                        <img src={rev.profiles?.avatar_url || 'https://via.placeholder.com/30'} style={styles.miniPfp} alt="pfp" />
                        <span style={styles.userName}>{rev.profiles?.username || 'Unknown User'}</span>
                        <span style={styles.timestamp}>{new Date(rev.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    {/* Review content - Click to open Detail Modal */}
                    <div onClick={() => setSelectedReview(rev)} style={{ cursor: 'pointer' }}>
                        <div style={{ color: '#d4a017', marginBottom: '5px' }}>★ {rev.rating}/5</div>
                        <div style={styles.reviewContent}>
                            {rev.review_comment.length > 250 ? rev.review_comment.substring(0, 250) + "..." : rev.review_comment}
                        </div>
                    </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No reviews yet. Be the first to write one!</p>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL OVERLAYS --- */}
      {isCreateModalOpen && (
        <ReviewModal 
          book={bookData} 
          userId={currentUser?.id}
          onClose={() => setIsCreateModalOpen(false)}
          onReviewCreated={() => fetchReviews()} 
        />
      )}

      {selectedReview && (
        <ReviewDetailModal 
          review={{...selectedReview, Books: bookData}} // Inject book info for the modal display
          currentUserId={currentUser?.id}
          onClose={() => setSelectedReview(null)}
          onDeleteSuccess={() => fetchReviews()} 
        />
      )}
    </div>
  );
}

const styles = {
  backBtn: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' },
  detailContainer: { marginTop: '16px', maxWidth: '900px', border: '1px solid #ddd', borderRadius: '10px', padding: '18px' },
  coverImg: { width: '180px', height: '260px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  descriptionText: { margin: 0, color: '#333', lineHeight: 1.5, whiteSpace: 'pre-wrap' },
  statusCircle: {
      width: '32px', height: '32px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontSize: '18px', cursor: 'pointer', boxShadow: '0 3px 6px rgba(0,0,0,0.15)', transition: '0.2s', fontWeight: 'bold',
      position: 'absolute', bottom: '-18px', right: '-15px'   
  },
  shelfDropdown: {
      position: 'absolute', top: '12px', right: '10px', width: '200px', background: 'white', border: '1px solid #eee',
      borderRadius: '10px', boxShadow: '0 8px 20px rgba(0,0,0,0.12)', padding: '12px', zIndex: 100
  },
  shelfItem: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px',
      cursor: 'pointer', marginBottom: '5px', transition: 'background 0.2s', border: '1px solid #f9f9f9', backgroundColor: '#fff'
  },
  shelfItemDisabled: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px',
      marginBottom: '5px', border: '1px dashed #eee', color: '#ccc', backgroundColor: '#fafafa'
  },
  miniCheck: {
      width: '20px', height: '20px', borderRadius: '50%', color: 'white', display: 'flex', justifyContent: 'center',
      alignItems: 'center', fontSize: '12px', fontWeight: 'bold'
  },
  reviewsContainer: { marginTop: '20px', maxWidth: '900px', border: '1px solid #eee', borderRadius: '10px', padding: '16px', background: '#fafafa' },
  submitBtn: { padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#333', color: '#fff', cursor: 'pointer', fontWeight: 'bold' },
  reviewCardWrapper: {
    padding: '15px',
    background: '#fff',
    border: '1px solid #eee',
    borderRadius: '8px',
    marginBottom: '10px'
  },
  userInfoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
    cursor: 'pointer'
  },
  miniPfp: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  userName: {
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#333'
  },
  timestamp: {
    fontSize: '12px',
    color: '#999',
    marginLeft: 'auto'
  },
  reviewContent: { color: '#333', lineHeight: 1.5, whiteSpace: 'pre-wrap', fontSize: '14px' }
};

export default BookDetailPage;