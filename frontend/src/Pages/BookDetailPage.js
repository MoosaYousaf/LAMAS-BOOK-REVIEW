import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import SidebarNav from '../Components/SidebarNav';
import UserCard from '../Components/Cards/UserCard';
import { supabase } from '../Services/supabaseClient';

function BookDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isbn } = useParams();

  // --- UPDATED DATA LOGIC ---
  // Initial state uses navigation state if available, otherwise null
  const [bookData, setBookData] = useState(location.state?.book || null);
  const bookIsbn = bookData?.isbn || isbn;

  // Use bookData for the UI fields
  const title = bookData?.book_title || bookData?.title || 'Loading...';
  const author = bookData?.book_author || bookData?.author || 'Loading author...';
  const cover = bookData?.image_url_l || bookData?.image_url_m || bookData?.image_url_s || 'https://via.placeholder.com/150x200?text=No+Image';
  const description = bookData?.description || bookData?.book_description || bookData?.summary || 'No description available.';

  // State for Reviews
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState('');

  // State for Current User and Review Form
  const [currentUser, setCurrentUser] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // --- NEW STATE FOR SHELVES ---
  const [myShelves, setMyShelves] = useState([]);
  const [showShelfSelector, setShowShelfSelector] = useState(false);
  const [isHoveringX, setIsHoveringX] = useState(null); 

  // --- EFFECT: FETCH BOOK INFO IF STATE IS MISSING ---
  useEffect(() => {
    const fetchBookInfo = async () => {
      // If we don't have book data yet (e.g. navigation from list/URL refresh)
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

  const fetchReviews = async () => {
    if (!bookIsbn) return;
    setLoadingReviews(true);
    const { data: reviewData, error: reviewError } = await supabase
      .from('Reviews')
      .select('id, rating, content, created_at, user_id')
      .eq('book_id', bookIsbn)
      .order('created_at', { ascending: false });

    if (reviewError) {
      setReviewsError(reviewError.message);
      setLoadingReviews(false);
      return;
    }

    const userIds = [...new Set((reviewData || []).map((r) => r.user_id).filter(Boolean))];
    if (userIds.length === 0) {
      setReviews(reviewData || []);
      setLoadingReviews(false);
      return;
    }

    const { data: profileData } = await supabase.from('Profiles').select('id, username, avatar_url').in('id', userIds);
    const profileMap = {};
    (profileData || []).forEach(p => profileMap[p.id] = p);
    setReviews((reviewData || []).map(r => ({ ...r, profiles: profileMap[r.user_id] || null })));
    setLoadingReviews(false);
  };

  useEffect(() => { fetchReviews(); }, [bookIsbn]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);
    const { error } = await supabase.from('Reviews').insert({
      book_id: bookIsbn, user_id: currentUser.id, rating: reviewRating, content: reviewText,
    });
    setSubmitting(false);
    if (!error) { setReviewText(''); setReviewRating(5); fetchReviews(); }
  };

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

        <div style={styles.reviewsContainer}>
          <h3 style={{ margin: '0 0 12px' }}>Reviews</h3>
          {currentUser && (
            <form onSubmit={handleSubmitReview} style={styles.reviewForm}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label><strong>Rating:</strong></label>
                <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} style={styles.selectInput}>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} / 5</option>)}
                </select>
              </div>
              <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Write your review..." required rows={4} style={styles.textarea} />
              <button type="submit" disabled={submitting} style={styles.submitBtn}>{submitting ? 'Posting...' : 'Post Review'}</button>
            </form>
          )}
          {loadingReviews && <div>Loading reviews...</div>}
          {reviews.map((rev) => (
            <div key={rev.id} style={styles.reviewCard}>
              <UserCard user={rev.profiles} />
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '6px' }}><span style={{ color: '#d4a017' }}>★ {rev.rating}/5</span></div>
                <div style={styles.reviewContent}>{rev.content}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
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
  reviewForm: { marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' },
  selectInput: { padding: '6px', borderRadius: '4px', border: '1px solid #ccc' },
  textarea: { padding: '10px', borderRadius: '6px', border: '1px solid #ccc', resize: 'vertical' },
  submitBtn: { alignSelf: 'flex-start', padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#333', color: '#fff', cursor: 'pointer' },
  reviewCard: { display: 'flex', gap: '12px', padding: '12px', borderRadius: '8px', background: '#fff', border: '1px solid #eee', marginBottom: '10px' },
  reviewContent: { color: '#333', lineHeight: 1.5, whiteSpace: 'pre-wrap' }
};

export default BookDetailPage;