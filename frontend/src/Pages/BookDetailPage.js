import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import SidebarNav from '../Components/SidebarNav';
import UserCard from '../Components/Cards/UserCard';
import { supabase } from '../Services/supabaseClient';

function BookDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isbn } = useParams();

  const book = location.state?.book;

  const title = book?.book_title || book?.title || 'Unknown title';
  const author = book?.book_author || book?.author || 'Unknown author';
  const cover =
    book?.image_url_l ||
    book?.image_url_m ||
    book?.image_url_s ||
    'https://via.placeholder.com/150x200?text=No+Image';
  const description =
    book?.description ||
    book?.book_description ||
    book?.summary ||
    book?.descripition ||
    'No description available.';

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState('');

  useEffect(() => {
  const fetchReviews = async () => {
    const bookIsbn = book?.isbn || isbn;
    if (!bookIsbn) return;

    setLoadingReviews(true);
    setReviewsError('');

    const { data: reviewData, error: reviewError } = await supabase
      .from('Reviews')
      .select('id, rating, content, created_at, user_id')
      .eq('book_id', bookIsbn)
      .order('created_at', { ascending: false });

    if (reviewError) {
      console.error(reviewError);
      setReviewsError(reviewError.message || 'Could not load reviews');
      setReviews([]);
      setLoadingReviews(false);
      return;
    }

    const userIds = [...new Set((reviewData || []).map((r) => r.user_id).filter(Boolean))];

    if (userIds.length === 0) {
      setReviews(reviewData || []);
      setLoadingReviews(false);
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', userIds);

    if (profileError) {
      console.error(profileError);
      setReviewsError(profileError.message || 'Could not load user info');
      setReviews([]);
      setLoadingReviews(false);
      return;
    }

    const profileMap = {};
    (profileData || []).forEach((profile) => {
      profileMap[profile.id] = profile;
    });

    const mergedReviews = (reviewData || []).map((review) => ({
      ...review,
      profiles: profileMap[review.user_id] || null,
    }));

    setReviews(mergedReviews);
    setLoadingReviews(false);
  };

  fetchReviews();
}, [book?.isbn, isbn]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <SidebarNav />

      <div style={{ flex: 1, padding: '20px' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          Back
        </button>

        <div
          style={{
            marginTop: '16px',
            maxWidth: '900px',
            border: '1px solid #ddd',
            borderRadius: '10px',
            padding: '18px',
          }}
        >
          <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
            <img
              src={cover}
              alt={title}
              style={{ width: '180px', height: '260px', objectFit: 'cover', borderRadius: '8px' }}
            />

            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0 }}>{title}</h2>
              <div style={{ marginTop: '6px', color: '#555' }}>
                <strong>Author:</strong> {author}
              </div>
              <div style={{ marginTop: '6px', color: '#555' }}>
                <strong>ISBN:</strong> {book?.isbn || isbn || 'Unknown'}
              </div>

              <div style={{ marginTop: '14px' }}>
                <h4 style={{ margin: '0 0 8px' }}>Description</h4>
                <p style={{ margin: 0, color: '#333', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {description}
                </p>
              </div>

              {!book && (
                <div style={{ marginTop: '14px', color: '#777', fontSize: '13px' }}>
                  Note: no book data was passed to this page. Navigate here by clicking a book from Search results.
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: '20px',
            maxWidth: '900px',
            border: '1px solid #eee',
            borderRadius: '10px',
            padding: '16px',
            background: '#fafafa',
          }}
        >
          <h3 style={{ margin: '0 0 12px' }}>Reviews</h3>

          {loadingReviews && <div style={{ color: '#666' }}>Loading reviews...</div>}
          {reviewsError && <div style={{ color: 'crimson' }}>Error: {reviewsError}</div>}

          {!loadingReviews && !reviewsError && reviews.length === 0 && (
            <div style={{ color: '#666' }}>No reviews yet.</div>
          )}

          {reviews.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    background: '#fff',
                    alignItems: 'flex-start',
                    border: '1px solid #eee',
                  }}
                >
                  <UserCard user={rev.profiles} />

                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '6px', color: '#333' }}>
                      {typeof rev.rating === 'number' && (
                        <span style={{ color: '#d4a017' }}>★ {rev.rating}/5</span>
                      )}
                      <span style={{ marginLeft: '8px', color: '#888', fontSize: '12px' }}>
                        {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : ''}
                      </span>
                    </div>

                    <div style={{ color: '#333', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {rev.content || 'No review text provided.'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage;