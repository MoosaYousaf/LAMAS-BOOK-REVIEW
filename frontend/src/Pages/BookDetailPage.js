import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import SidebarNav from '../Components/SidebarNav';
import { supabase } from '../Services/supabaseClient';
import ReviewModal from '../Components/Reviews/ReviewModal';
import ReviewDetailModal from '../Components/Reviews/ReviewDetailModal';
import UserReviewCard from '../Components/Cards/UserReviewCard';

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

  // Track which private accounts the user is allowed to see
  const [acceptedFollowing, setAcceptedFollowing] = useState([]);

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

  // Fetch Shelves Helper
  const fetchMyShelves = useCallback(async (userId) => {
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
  }, []);

  useEffect(() => {
    const initUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        
        if (user) {
            fetchMyShelves(user.id);
            const { data: following } = await supabase
                .from('Followers')
                .select('following_id')
                .eq('follower_id', user.id)
                .eq('status', 'accepted');
            
            setAcceptedFollowing(following?.map(f => f.following_id) || []);
        }
    };
    initUser();
  }, [bookIsbn, fetchMyShelves]);

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

  // --- FETCH REVIEWS LOGIC WRAPPED IN CALLBACK ---
  const fetchReviews = useCallback(async () => {
    if (!bookIsbn) return;
    setLoadingReviews(true);
    
    const { data, error } = await supabase
      .from('Reviews')
      .select(`
        id, 
        rating, 
        review_comment, 
        created_at, 
        user_id,
        book_id,
        profiles: Reviews_user_id_fkey (
            id, 
            username, 
            avatar_url, 
            is_private
        )
      `)
      .eq('book_id', bookIsbn) 
      .order('created_at', { ascending: false });

    if (error) {
        console.error("Supabase error fetching reviews:", error.message);
    }

    if (data) {
      const filtered = data.filter(rev => {
        if (currentUser?.id === rev.user_id) return true;
        if (!rev.profiles) return false;
        if (!rev.profiles.is_private) return true;
        return acceptedFollowing.includes(rev.user_id);
      });

      setReviews(filtered);
    }
    setLoadingReviews(false);
  }, [bookIsbn, currentUser, acceptedFollowing]); // Dependencies for the callback

  useEffect(() => { 
    fetchReviews(); 
  }, [fetchReviews]); // fetchReviews is now a safe dependency

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
                <UserReviewCard 
                    key={rev.id} 
                    isBookDetailPage={true}
                    review={{
                      ...rev, 
                      Books: {
                        book_title: rev.profiles?.username || "Unknown User",
                        book_author: "Reader", 
                        image_url_m: rev.profiles?.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${rev.profiles?.username || 'fallback'}`
                      }
                    }} 
                    onClick={() => setSelectedReview(rev)} 
                />
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No reviews yet.</p>
            )}
          </div>
        </div>
      </div>

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
          review={{
            ...selectedReview, 
            Books: {
              ...bookData,
              book_title: title,
              book_author: author,
              book_cover_url: cover
            }
          }} 
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
  submitBtn: { padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#333', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }
};

export default BookDetailPage;